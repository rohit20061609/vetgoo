import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { petSchema } from "@/lib/schemas";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pets: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      animals: user.pets.map((animal: any) => ({
        id: animal.id,
        name: animal.name,
        type: animal.type,
        breed: animal.breed,
        age: animal.age,
        weight: animal.weight,
        image: animal.image,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching animals:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch animals" },
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
    const validated = petSchema.parse(body);

    const animal = await prisma.pet.create({
      data: {
        userId: user.id,
        ...validated,
      },
    });

    return NextResponse.json({
      animal: {
        id: animal.id,
        name: animal.name,
        type: animal.type,
        breed: animal.breed,
        age: animal.age,
        weight: animal.weight,
      },
    });
  } catch (error: any) {
    console.error("Error creating animal:", error?.message || error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create animal" },
      { status: 500 }
    );
  }
}
