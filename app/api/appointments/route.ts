import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
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
        vet: {
          include: { user: true },
        },
        slot: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      appointments: appointments.map((apt) => ({
        id: apt.id,
        type: apt.type,
        status: apt.status,
        notes: apt.notes,
        vetName: apt.vet.user.name,
        clinicName: apt.vet.clinicName,
        date: apt.slot.date.toISOString(),
        startTime: apt.slot.startTime,
        endTime: apt.slot.endTime,
        paymentStatus: apt.payment?.status,
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
    const { vetId, slotId, type, animalId, notes } = body;

    if (!vetId || !slotId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slot is available
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.isBooked) {
      return NextResponse.json(
        { error: "Slot is not available" },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        vetId,
        slotId,
        type: type as "ONLINE" | "VIDEO" | "CLINIC_VISIT" | "FARM_VISIT",
        status: "PENDING",
        notes,
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
