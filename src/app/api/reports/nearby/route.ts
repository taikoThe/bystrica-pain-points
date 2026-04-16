import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const radius = parseFloat(searchParams.get("radius") || "200"); // meters

  if (!lat || !lng) {
    return NextResponse.json([]);
  }

  // Approximate degree to meter conversion at this latitude
  const latDelta = radius / 111320;
  const lngDelta = radius / (111320 * Math.cos((lat * Math.PI) / 180));

  const nearby = await prisma.report.findMany({
    where: {
      latitude: { gte: lat - latDelta, lte: lat + latDelta },
      longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
      status: { notIn: ["RESOLVED", "REJECTED", "DUPLICATE"] },
    },
    select: { id: true, title: true, latitude: true, longitude: true },
    take: 5,
  });

  // Calculate actual distance using Haversine
  const results = nearby.map((r) => {
    const R = 6371e3;
    const dLat = ((r.latitude - lat) * Math.PI) / 180;
    const dLon = ((r.longitude - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((r.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return { id: r.id, title: r.title, distance };
  });

  return NextResponse.json(results.filter((r) => r.distance <= radius));
}
