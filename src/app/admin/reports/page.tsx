import { prisma } from "@/lib/prisma";
import { ReportTable } from "@/components/admin/ReportTable";
import { AdminReportsClient } from "./AdminReportsClient";
import type { ReportListItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [reports, categories] = await Promise.all([
    prisma.report.findMany({
      include: {
        category: true,
        _count: { select: { confirmations: true, attachments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Správa hlásení</h1>
        <p className="text-sm text-slate-500 mt-1">
          Prehľad a moderácia všetkých hlásení ({reports.length})
        </p>
      </div>

      <AdminReportsClient reports={reports as ReportListItem[]} categories={categories} />
    </div>
  );
}
