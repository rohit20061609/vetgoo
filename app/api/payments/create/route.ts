import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { z } from "zod";

const createPaymentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID required"),
});

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
    
    // Validate input
    const { appointmentId } = createPaymentSchema.parse(body);

    // Fetch user to get their ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch appointment and verify it belongs to the authenticated user
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { user: true, pet: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // SECURITY: Verify the appointment belongs to the authenticated user
    if (appointment.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Appointment does not belong to user" },
        { status: 403 }
      );
    }

    // SECURITY: Calculate amount server-side based on appointment details
    // Don't trust the client-provided amount
    const CONSULTATION_PRICE = 500; // Base price in paise (₹5.00)
    const amount = CONSULTATION_PRICE;

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      metadata: {
        appointmentId,
        userId: user.id,
        petId: appointment.petId,
      },
      description: `Veterinary consultation - ${appointment.clinic || "VetGo Clinic"}`,
    });

    // Save payment to database
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount / 100, // Convert back to rupees
        currency: "inr",
        status: "PENDING",
        stripePaymentIntentId: paymentIntent.id,
        description: `Veterinary consultation - ${appointment.clinic || "VetGo Clinic"}`,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
