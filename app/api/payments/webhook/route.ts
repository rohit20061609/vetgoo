import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { Resend } from "resend";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// Schema for validating payment metadata
const paymentMetadataSchema = z.object({
  appointmentId: z.string(),
  userId: z.string().optional(),
  petId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    // Initialize Resend only when needed and if API key is available
    const resend = process.env.RESEND_API_KEY 
      ? new Resend(process.env.RESEND_API_KEY)
      : null;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Validate metadata structure
      let metadata;
      try {
        metadata = paymentMetadataSchema.parse(paymentIntent.metadata);
      } catch (err) {
        console.error("Invalid payment metadata:", err);
        return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
      }

      const appointmentId = metadata.appointmentId;

      // SECURITY: Check if payment already processed (idempotency)
      const existingPayment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (existingPayment && existingPayment.status === "COMPLETED") {
        // Payment already processed - return success to acknowledge webhook
        console.log(`Payment ${paymentIntent.id} already processed, skipping duplicate`);
        return NextResponse.json({ received: true });
      }

      // Fetch appointment and validate
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { user: true, pet: true },
      });

      if (!appointment) {
        console.error(`Appointment ${appointmentId} not found for payment ${paymentIntent.id}`);
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
      }

      // SECURITY: Validate amount and currency match
      const CONSULTATION_PRICE = 500; // in paise (₹5.00)
      if (paymentIntent.amount !== CONSULTATION_PRICE) {
        console.error(`Amount mismatch: expected ${CONSULTATION_PRICE}, got ${paymentIntent.amount}`);
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      if (paymentIntent.currency !== "inr") {
        console.error(`Currency mismatch: expected inr, got ${paymentIntent.currency}`);
        return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
      }

      // Update payment status
      await prisma.payment.upsert({
        where: { stripePaymentIntentId: paymentIntent.id },
        create: {
          userId: appointment.userId,
          amount: CONSULTATION_PRICE / 100,
          currency: "inr",
          status: "COMPLETED",
          stripePaymentIntentId: paymentIntent.id,
          description: `Veterinary consultation - ${appointment.clinic || "VetGo Clinic"}`,
        },
        update: { status: "COMPLETED" },
      });

      // Update appointment status
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED" },
        include: { user: true, pet: true },
      });

      // Send confirmation email to user (if Resend API key is configured)
      if (resend && updatedAppointment.user.email) {
        try {
          await resend.emails.send({
            from: "VetGo <noreply@vetgoo.in>",
            to: updatedAppointment.user.email,
            subject: "Appointment Confirmed ✓",
            html: `
              <h2>Appointment Confirmed! ✓</h2>
              <p>Your appointment is confirmed.</p>
              <p><strong>Appointment Type:</strong> ${updatedAppointment.appointmentType}</p>
              <p><strong>Date & Time:</strong> ${updatedAppointment.scheduledFor.toLocaleString()}</p>
              <p><strong>Duration:</strong> ${updatedAppointment.duration} minutes</p>
              <p><strong>Pet:</strong> ${updatedAppointment.pet.name}</p>
              ${updatedAppointment.clinic ? `<p><strong>Clinic:</strong> ${updatedAppointment.clinic}</p>` : ""}
              ${updatedAppointment.veterinarian ? `<p><strong>Veterinarian:</strong> ${updatedAppointment.veterinarian}</p>` : ""}
              <p>Amount paid: ₹${paymentIntent.amount / 100}</p>
              <p>Check your dashboard for more details.</p>
            `,
          });
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
