import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  } catch (error) {
    console.error("Error fetching appointments:", error);
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
    const { petId, title, description, appointmentType, scheduledFor, duration, veterinarian, clinic, notes } = body;

    if (!petId || !title || !appointmentType || !scheduledFor) {
      return NextResponse.json(
        { error: "Missing required fields: petId, title, appointmentType, scheduledFor" },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        petId,
        title,
        description: description || null,
        appointmentType,
        scheduledFor: new Date(scheduledFor),
        duration: duration || 30,
        veterinarian: veterinarian || null,
        clinic: clinic || null,
        notes: notes || null,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({
      appointmentId: appointment.id,
      status: appointment.status,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
