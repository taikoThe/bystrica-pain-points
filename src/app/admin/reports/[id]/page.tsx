import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminReportDetailClient } from "./AdminReportDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminReportDetailPage({ params }: Props) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } },
      attachments: true,
      updates: { orderBy: { createdAt: "desc" } },
      confirmations: true,
      adminActions: {
        include: { admin: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { confirmations: true } },
    },
  });

  if (!report) notFound();

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="p-6">
      <AdminReportDetailClient report={report} categories={categories} />
    </div>
  );
}
