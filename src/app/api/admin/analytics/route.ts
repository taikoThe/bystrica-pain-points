import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Neautorizovaný prístup" }, { status: 403 });
  }

  const [
    totalReports,
    byStatus,
    byCategory,
    recentReports,
    totalConfirmations,
    totalUsers,
  ] = await Promise.all([
    prisma.report.count(),
    prisma.report.groupBy({ by: ["status"], _count: true }),
    prisma.report.groupBy({
      by: ["categoryId"],
      _count: true,
      orderBy: { _count: { categoryId: "desc" } },
    }),
    prisma.report.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.confirmation.count(),
    prisma.user.count(),
  ]);

  const categories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  return NextResponse.json({
    totalReports,
    recentReports,
    totalConfirmations,
    totalUsers,
    byStatus: byStatus.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    byCategory: byCategory.map((c) => ({
      category: categoryMap[c.categoryId],
      count: c._count,
    })),
  });
}
