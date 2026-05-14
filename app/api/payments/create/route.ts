import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { appointmentId, amount } = body;

    if (!appointmentId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { user: true, vet: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to paise
      currency: "inr",
      metadata: {
        appointmentId,
        userId: appointment.userId,
        vetId: appointment.vetId,
      },
      description: `Veterinary consultation - ${appointment.vet.clinicName}`,
    });

    // Save payment to database
    await prisma.payment.create({
      data: {
        userId: appointment.userId,
        appointmentId,
        stripePaymentId: paymentIntent.id,
        amount,
        currency: "inr",
        status: "pending",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
