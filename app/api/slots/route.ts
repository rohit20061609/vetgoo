import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vetId = searchParams.get("vetId");
    const type = searchParams.get("type") || "online";
    const daysAhead = parseInt(searchParams.get("daysAhead") || "7");

    if (!vetId) {
      return NextResponse.json(
        { error: "Vet ID required" },
        { status: 400 }
      );
    }

    // Get slots for the next N days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        vetId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({
      slots: slots.map((slot) => ({
        id: slot.id,
        date: slot.date.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: slot.isBooked,
      })),
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vetId, date, startTime, endTime } = body;

    if (!vetId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        vetId,
        date: new Date(date),
        startTime,
        endTime,
        isBooked: false,
      },
    });

    return NextResponse.json({
      slot: {
        id: slot.id,
        date: slot.date.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: slot.isBooked,
      },
    });
  } catch (error) {
    console.error("Error creating slot:", error);
    return NextResponse.json(
      { error: "Failed to create slot" },
      { status: 500 }
    );
  }
}
