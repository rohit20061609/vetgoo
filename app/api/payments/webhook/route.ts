import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
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
      const appointmentId = paymentIntent.metadata.appointmentId as string;

      // Update payment status
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: "COMPLETED" },
      });

      // Update appointment status
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED" },
        include: { user: true, pet: true },
      });

      // Send confirmation email to user (if Resend API key is configured)
      if (resend) {
        try {
          await resend.emails.send({
            from: "VetGo <noreply@vetgo.app>",
            to: appointment.user.email || "",
            subject: "Appointment Confirmed ✓",
            html: `
              <h2>Appointment Confirmed! ✓</h2>
              <p>Your appointment is confirmed.</p>
              <p><strong>Appointment Type:</strong> ${appointment.appointmentType}</p>
              <p><strong>Date & Time:</strong> ${appointment.scheduledFor.toLocaleString()}</p>
              <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
              <p><strong>Pet:</strong> ${appointment.pet.name}</p>
              ${appointment.clinic ? `<p><strong>Clinic:</strong> ${appointment.clinic}</p>` : ""}
              ${appointment.veterinarian ? `<p><strong>Veterinarian:</strong> ${appointment.veterinarian}</p>` : ""}
              <p>Amount paid: ₹${paymentIntent.amount / 100}</p>
              <p>Check your dashboard for more details.</p>
            `,
          });
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }
      } else {
        console.log("Resend API key not configured, skipping email notification");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
