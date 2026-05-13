import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

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
        where: { stripePaymentId: paymentIntent.id },
        data: { status: "succeeded" },
      });

      // Update appointment status
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED" },
        include: { user: true, vet: true, slot: true },
      });

      // Mark slot as booked
      await prisma.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: true },
      });

      // Send confirmation emails
      try {
        await resend.emails.send({
          from: "VetGo <noreply@vetgo.app>",
          to: appointment.user.email || "",
          subject: "Your appointment with " + appointment.vet.clinicName,
          html: `
            <h2>Appointment Confirmed! ✓</h2>
            <p>Your appointment with <strong>${appointment.vet.user.name}</strong> at <strong>${appointment.vet.clinicName}</strong> is confirmed.</p>
            <p><strong>Date:</strong> ${appointment.slot.date.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.slot.startTime} - ${appointment.slot.endTime}</p>
            <p>Amount paid: ₹${appointment.paymentId ? 'Paid' : 'Pending'}</p>
            <p>Join from your dashboard when the time comes.</p>
          `,
        });

        // Send email to vet
        await resend.emails.send({
          from: "VetGo <noreply@vetgo.app>",
          to: appointment.vet.user.email || "",
          subject: "New appointment confirmed",
          html: `
            <h2>New Appointment</h2>
            <p>Patient: <strong>${appointment.user.name}</strong></p>
            <p>Date: <strong>${appointment.slot.date.toLocaleDateString()}</strong></p>
            <p>Time: <strong>${appointment.slot.startTime}</strong></p>
            <p>Type: <strong>${appointment.type}</strong></p>
          `,
        });
      } catch (emailError) {
        console.error("Error sending confirmation emails:", emailError);
        // Don't fail the webhook if emails fail
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
