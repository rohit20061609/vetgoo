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
      include: {
        animals: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      animals: user.animals.map((animal: any) => ({
        id: animal.id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        age: animal.ageMonths,
        weight: animal.weightKg,
        photoUrl: animal.photoUrl,
      })),
    });
  } catch (error) {
    console.error("Error fetching animals:", error);
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
    const { name, species, breed, ageMonths, weightKg, photoUrl } = body;

    if (!name || !species) {
      return NextResponse.json(
        { error: "Name and species are required" },
        { status: 400 }
      );
    }

    const animal = await prisma.animal.create({
      data: {
        userId: user.id,
        name,
        species,
        breed: breed || null,
        ageMonths: ageMonths || null,
        weightKg: weightKg || null,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json({
      animal: {
        id: animal.id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        age: animal.ageMonths,
        weight: animal.weightKg,
      },
    });
  } catch (error) {
    console.error("Error creating animal:", error);
    return NextResponse.json(
      { error: "Failed to create animal" },
      { status: 500 }
    );
  }
}
