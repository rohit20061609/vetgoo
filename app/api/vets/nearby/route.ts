import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "25"); // km
    const species = searchParams.get("species");
    const type = searchParams.get("type");
    const maxFee = searchParams.get("maxFee")
      ? parseInt(searchParams.get("maxFee") || "2000")
      : 2000;
    const availableToday = searchParams.get("availableToday") === "true";

    if (lat === 0 || lng === 0) {
      return NextResponse.json(
        { error: "Valid latitude and longitude required" },
        { status: 400 }
      );
    }

    // Get all vets from database
    let vets = await prisma.vetProfile.findMany({
      include: {
        user: true,
        slots: {
          where: {
            date: availableToday
              ? {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lt: new Date(new Date().setHours(23, 59, 59, 999)),
                }
              : undefined,
            isBooked: false,
          },
        },
      },
    });

    // Calculate distance and filter
    const vetList = vets
      .map((vet) => ({
        ...vet,
        distance: haversineDistance(lat, lng, vet.latitude, vet.longitude),
      }))
      .filter((vet) => {
        // Distance filter
        if (vet.distance > radius) return false;

        // Species filter
        if (species && !vet.specialisations.includes(species)) return false;

        // Fee filter
        const fee =
          type === "online"
            ? vet.consultFeeOnline
            : type === "visit"
            ? vet.consultFeeVisit
            : Math.min(vet.consultFeeOnline, vet.consultFeeVisit);
        if (fee > maxFee) return false;

        // Available today filter
        if (availableToday && vet.slots.length === 0) return false;

        return true;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // Top 20 nearest

    return NextResponse.json({
      vets: vetList.map((vet) => ({
        id: vet.id,
        name: vet.user.name,
        clinicName: vet.clinicName,
        clinicAddress: vet.clinicAddress,
        latitude: vet.latitude,
        longitude: vet.longitude,
        specialisations: vet.specialisations,
        consultFeeOnline: vet.consultFeeOnline,
        consultFeeVisit: vet.consultFeeVisit,
        isVerified: vet.isVerified,
        rating: vet.rating,
        totalRatings: vet.totalRatings,
        bio: vet.bio,
        distance: parseFloat(vet.distance.toFixed(2)),
        availableSlots: vet.slots.length,
      })),
      count: vetList.length,
    });
  } catch (error) {
    console.error("Error fetching nearby vets:", error);
    return NextResponse.json(
      { error: "Failed to fetch vets" },
      { status: 500 }
    );
  }
}
