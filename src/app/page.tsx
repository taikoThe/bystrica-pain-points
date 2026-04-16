import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { HomePageClient } from "./HomePageClient";
import type { MapMarkerData, ReportListItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [reports, categories, user] = await Promise.all([
    prisma.report.findMany({
      include: {
        category: true,
        _count: { select: { confirmations: true, attachments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getCurrentUser(),
  ]);

  const markers: MapMarkerData[] = reports.map((r) => ({
    id: r.id,
    title: r.title,
    latitude: r.latitude,
    longitude: r.longitude,
    status: r.status,
    categorySlug: r.category.slug,
    categoryColor: r.category.color,
    categoryIcon: r.category.icon,
    categoryName: r.category.name,
    confirmationCount: r._count.confirmations,
    createdAt: r.createdAt.toISOString(),
  }));

  const reportList: ReportListItem[] = reports.map((r) => ({
    ...r,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return (
    <HomePageClient
      markers={markers}
      reports={reportList}
      categories={categories}
      user={user}
    />
  );
}
