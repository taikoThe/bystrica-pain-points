import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { ReportTable } from "@/components/admin/ReportTable";
import { FileText, CheckCircle, Clock, AlertTriangle, Users, ThumbsUp } from "lucide-react";
import type { ReportListItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalReports,
    newReports,
    inProgressReports,
    resolvedReports,
    totalUsers,
    totalConfirmations,
    recentReports,
  ] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: "NEW" } }),
    prisma.report.count({ where: { status: "IN_PROGRESS" } }),
    prisma.report.count({ where: { status: "RESOLVED" } }),
    prisma.user.count(),
    prisma.confirmation.count(),
    prisma.report.findMany({
      include: {
        category: true,
        _count: { select: { confirmations: true, attachments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Prehľad hlásení a aktivít</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Celkom hlásení" value={totalReports} icon={FileText} color="#3B82F6" />
        <StatsCard title="Nové" value={newReports} icon={AlertTriangle} color="#F59E0B" />
        <StatsCard title="V riešení" value={inProgressReports} icon={Clock} color="#8B5CF6" />
        <StatsCard title="Vyriešené" value={resolvedReports} icon={CheckCircle} color="#10B981" />
        <StatsCard title="Používatelia" value={totalUsers} icon={Users} color="#EC4899" />
        <StatsCard title="Potvrdenia" value={totalConfirmations} icon={ThumbsUp} color="#06B6D4" />
      </div>

      {/* Recent reports */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Posledné hlásenia</h2>
        <ReportTable reports={recentReports as ReportListItem[]} />
      </div>
    </div>
  );
}
