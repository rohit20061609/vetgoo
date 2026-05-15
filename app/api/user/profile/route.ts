import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/schemas";
import { z } from "zod";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // SECURITY: Return only necessary fields, exclude sensitive data
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      userType: user.userType,
      profile: user.profile ? {
        address: user.profile.address,
        city: user.profile.city,
        state: user.profile.state,
        zipCode: user.profile.zipCode,
        country: user.profile.country,
      } : null,
    });
  } catch (error: any) {
    console.error("Get user error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input with schema
    const validated = profileUpdateSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build update data only with provided fields
    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.phone !== undefined) updateData.phone = validated.phone;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { profile: true },
    });

    // Update or create profile
    if (
      validated.address !== undefined ||
      validated.city !== undefined ||
      validated.state !== undefined ||
      validated.zipCode !== undefined ||
      validated.country !== undefined
    ) {
      const profileData: any = {};
      if (validated.address !== undefined) profileData.address = validated.address;
      if (validated.city !== undefined) profileData.city = validated.city;
      if (validated.state !== undefined) profileData.state = validated.state;
      if (validated.zipCode !== undefined) profileData.zipCode = validated.zipCode;
      if (validated.country !== undefined) profileData.country = validated.country;

      const updated = await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...profileData,
        },
        update: profileData,
      });

      updatedUser.profile = updated;
    }

    // SECURITY: Return only necessary fields
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      image: updatedUser.image,
      userType: updatedUser.userType,
      profile: updatedUser.profile ? {
        address: updatedUser.profile.address,
        city: updatedUser.profile.city,
        state: updatedUser.profile.state,
        zipCode: updatedUser.profile.zipCode,
        country: updatedUser.profile.country,
      } : null,
    });
  } catch (error: any) {
    console.error("Update user error:", error?.message || error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
