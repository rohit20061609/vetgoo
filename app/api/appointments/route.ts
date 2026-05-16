import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appointmentSchema } from "@/lib/schemas";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        pet: true,
        reminders: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      appointments: appointments.map((apt: any) => ({
        id: apt.id,
        type: apt.appointmentType,
        status: apt.status,
        title: apt.title,
        notes: apt.notes,
        petName: apt.pet.name,
        veterinarian: apt.veterinarian,
        clinic: apt.clinic,
        scheduledFor: apt.scheduledFor.toISOString(),
        duration: apt.duration,
        createdAt: apt.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching appointments:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    // Validate input with schema
    const validated = appointmentSchema.parse(body);

    // Verify the pet belongs to the user
    const pet = await prisma.pet.findUnique({
      where: { id: validated.petId },
    });

    if (!pet || pet.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Pet not found or does not belong to user" },
        { status: 403 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        petId: validated.petId,
        title: validated.title,
        description: validated.description,
        appointmentType: validated.appointmentType,
        scheduledFor: new Date(validated.scheduledFor),
        duration: validated.duration,
        veterinarian: validated.veterinarian,
        clinic: validated.clinic,
        notes: validated.notes,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({
      appointmentId: appointment.id,
      status: appointment.status,
    });
  } catch (error: any) {
    console.error("Error creating appointment:", error instanceof Error ? error.message : String(error));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
