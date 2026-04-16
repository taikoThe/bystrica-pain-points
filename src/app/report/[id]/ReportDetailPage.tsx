"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-path";
import { ReportDetail } from "@/components/reports/ReportDetail";
import type { ReportWithRelations } from "@/types";

interface ReportDetailPageProps {
  report: ReportWithRelations;
  userId?: string;
}

export function ReportDetailPage({ report, userId }: ReportDetailPageProps) {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(
    report.confirmations.some((c) => c.userId === userId)
  );
  const [confirmCount, setConfirmCount] = useState(
    report._count?.confirmations || report.confirmations.length
  );

  const handleConfirm = async () => {
    try {
      const res = await fetch(api(`/api/reports/${report.id}/confirm`), {
        method: "POST",
      });
      if (res.ok) {
        setIsConfirmed(true);
        setConfirmCount((c) => c + 1);
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <ReportDetail
        report={report}
        onBack={() => router.back()}
        onConfirm={handleConfirm}
        isConfirmed={isConfirmed}
        confirmCount={confirmCount}
      />
    </div>
  );
}
