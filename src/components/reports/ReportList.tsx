"use client";

import { ReportCard } from "./ReportCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReportCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { MapPin } from "lucide-react";
import type { ReportListItem } from "@/types";

interface ReportListProps {
  reports: ReportListItem[];
  loading?: boolean;
  compact?: boolean;
  onReportClick?: (id: string) => void;
}

export function ReportList({ reports, loading = false, compact = false, onReportClick }: ReportListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ReportCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="Žiadne hlásenia"
        description="V tejto oblasti zatiaľ neboli nahlásené žiadne problémy."
      />
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          compact={compact}
          onClick={onReportClick ? () => onReportClick(report.id) : undefined}
        />
      ))}
    </div>
  );
}
