"use client";

import Link from "next/link";
import { MapPin, ThumbsUp, Clock, Image } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatRelativeDate, truncate } from "@/lib/utils";
import type { ReportListItem } from "@/types";

interface ReportCardProps {
  report: ReportListItem;
  compact?: boolean;
  onClick?: () => void;
}

export function ReportCard({ report, compact = false, onClick }: ReportCardProps) {
  const content = (
    <div
      className={`rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow cursor-pointer ${
        compact ? "p-3" : "p-4"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge
            name={report.category.name}
            icon={report.category.icon}
            color={report.category.color}
            size="sm"
            showLabel={!compact}
          />
          <StatusBadge status={report.status} size="sm" />
        </div>
        {report._count.attachments > 0 && (
          <div className="flex items-center gap-1 text-slate-400">
            <Image size={14} />
            <span className="text-xs">{report._count.attachments}</span>
          </div>
        )}
      </div>

      <h3 className={`font-semibold text-slate-800 mt-2 ${compact ? "text-sm" : "text-base"}`}>
        {compact ? truncate(report.title, 60) : report.title}
      </h3>

      {!compact && (
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
          {truncate(report.description, 120)}
        </p>
      )}

      <div className={`flex items-center gap-3 text-slate-400 ${compact ? "mt-2" : "mt-3"}`}>
        {report.address && (
          <div className="flex items-center gap-1 text-xs truncate">
            <MapPin size={12} />
            <span className="truncate">{truncate(report.address, 40)}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs ml-auto shrink-0">
          <Clock size={12} />
          <span>{formatRelativeDate(report.createdAt)}</span>
        </div>
        {report._count.confirmations > 0 && (
          <div className="flex items-center gap-1 text-xs shrink-0">
            <ThumbsUp size={12} />
            <span>{report._count.confirmations}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (onClick) return content;

  return (
    <Link href={`/report/${report.id}`} className="block">
      {content}
    </Link>
  );
}
