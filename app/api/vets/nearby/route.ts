import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nearbyVetsSchema } from "@/lib/schemas";
import { z } from "zod";

// Haversine formula to calculate distance between two coordinates
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");

    // Validate query parameters with schema
    const validated = nearbyVetsSchema.parse({
      lat: lat ? parseFloat(lat) : 0,
      lng: lng ? parseFloat(lng) : 0,
      radius: radius ? parseFloat(radius) : 25,
    });

    if (validated.lat === 0 || validated.lng === 0) {
      return NextResponse.json(
        { error: "Valid latitude and longitude required" },
        { status: 400 }
      );
    }

    // Get all veterinarians from database
    const vets = await prisma.user.findMany({
      where: { userType: "VETERINARIAN" },
      include: { profile: true },
    });

    // Calculate distance and filter
    const vetList = vets
      .map((vet: any) => ({
        ...vet,
        distance: vet.profile?.latitude && vet.profile?.longitude 
          ? haversineDistance(validated.lat, validated.lng, vet.profile.latitude, vet.profile.longitude)
          : validated.radius + 1, // Filter out vets without location
      }))
      .filter((vet: any) => {
        // Distance filter
        if (vet.distance > validated.radius) return false;
        return true;
      })
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 20); // Top 20 nearest

    return NextResponse.json({
      vets: vetList.map((vet: any) => ({
        id: vet.id,
        name: vet.name,
        // SECURITY: Don't expose email without explicit need
        // email: vet.email,
        phone: vet.phone,
        image: vet.image,
        // Profile information (public-facing only)
        address: vet.profile?.address,
        city: vet.profile?.city,
        state: vet.profile?.state,
        zipCode: vet.profile?.zipCode,
        country: vet.profile?.country,
        latitude: vet.profile?.latitude,
        longitude: vet.profile?.longitude,
        licenseNumber: vet.profile?.licenseNumber,
        specialization: vet.profile?.specialization,
        yearsOfExperience: vet.profile?.yearsOfExperience,
        bio: vet.profile?.bio,
        distance: parseFloat(vet.distance.toFixed(2)),
      })),
      count: vetList.length,
    });
  } catch (error: any) {
    console.error("Error fetching nearby vets:", error instanceof Error ? error.message : String(error));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch vets" },
      { status: 500 }
    );
  }
}
