"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatRelativeDate, truncate } from "@/lib/utils";
import { ThumbsUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportListItem } from "@/types";

interface ReportTableProps {
  reports: ReportListItem[];
}

export function ReportTable({ reports }: ReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="pb-3 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Hlásenie</th>
            <th className="pb-3 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Kategória</th>
            <th className="pb-3 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Stav</th>
            <th className="pb-3 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Potvrdenia</th>
            <th className="pb-3 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Dátum</th>
            <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Akcie</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 pr-4">
                <div className="max-w-xs">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {truncate(report.title, 50)}
                  </p>
                  {report.address && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {truncate(report.address, 40)}
                    </p>
                  )}
                </div>
              </td>
              <td className="py-3 pr-4">
                <CategoryBadge
                  name={report.category.name}
                  icon={report.category.icon}
                  color={report.category.color}
                  size="sm"
                />
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={report.status} />
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <ThumbsUp size={12} />
                  {report._count.confirmations}
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="text-sm text-slate-500">
                  {formatRelativeDate(report.createdAt)}
                </span>
              </td>
              <td className="py-3">
                <Link href={`/admin/reports/${report.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye size={14} className="mr-1" />
                    Detail
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
