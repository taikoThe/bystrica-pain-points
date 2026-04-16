import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { FileText, CheckCircle, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/constants";
import { ReportStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [totalReports, byStatus, byCategory, recentWeek, recentMonth] = await Promise.all([
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
    prisma.report.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const categories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
  const resolvedCount = statusMap["RESOLVED"] || 0;
  const resolutionRate = totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytika</h1>
        <p className="text-sm text-slate-500 mt-1">Štatistiky a prehľad hlásení</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Celkom hlásení" value={totalReports} icon={FileText} color="#3B82F6" />
        <StatsCard title="Tento týždeň" value={recentWeek} icon={TrendingUp} color="#8B5CF6" />
        <StatsCard title="Tento mesiac" value={recentMonth} icon={BarChart3} color="#F59E0B" />
        <StatsCard title="Miera vyriešenia" value={`${resolutionRate}%`} icon={CheckCircle} color="#10B981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Podľa stavu</h3>
          <div className="space-y-3">
            {(["NEW", "UNDER_REVIEW", "ACCEPTED", "IN_PROGRESS", "RESOLVED", "REJECTED", "DUPLICATE"] as ReportStatus[]).map((status) => {
              const count = statusMap[status] || 0;
              const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <StatusBadge status={status} size="sm" className="w-28" />
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: STATUS_CONFIG[status].color,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By category */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Podľa kategórie</h3>
          <div className="space-y-3">
            {byCategory.slice(0, 10).map((item) => {
              const cat = categoryMap[item.categoryId];
              if (!cat) return null;
              const percentage = totalReports > 0 ? (item._count / totalReports) * 100 : 0;
              return (
                <div key={item.categoryId} className="flex items-center gap-3">
                  <CategoryBadge
                    name={cat.name}
                    icon={cat.icon}
                    color={cat.color}
                    size="sm"
                    className="w-48 truncate"
                  />
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-10 text-right">{item._count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
