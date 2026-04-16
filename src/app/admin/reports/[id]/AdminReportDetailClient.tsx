"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-path";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { ModerationPanel } from "@/components/admin/ModerationPanel";
import { ReportTimeline } from "@/components/reports/ReportTimeline";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, MapPin, User, Mail, Phone, ThumbsUp, Image as ImageIcon } from "lucide-react";
import { ReportStatus } from "@prisma/client";
import type { AdminReportDetail } from "@/types";
import type { Category } from "@prisma/client";

interface AdminReportDetailClientProps {
  report: AdminReportDetail;
  categories: Category[];
}

export function AdminReportDetailClient({ report, categories }: AdminReportDetailClientProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(report.status);

  const handleStatusChange = async (status: ReportStatus, note: string) => {
    const res = await fetch(api(`/api/admin/reports/${report.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });

    if (res.ok) {
      setCurrentStatus(status);
      router.refresh();
    }
  };

  const photos = report.attachments.filter((a) => a.mimeType.startsWith("image/"));

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-1" />
          Späť
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={currentStatus} size="md" />
              <CategoryBadge
                name={report.category.name}
                icon={report.category.icon}
                color={report.category.color}
                size="md"
              />
            </div>

            <h1 className="text-xl font-bold text-slate-800">{report.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{report.description}</p>

            {/* Photos */}
            {photos.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
                  <ImageIcon size={14} />
                  Fotografie ({photos.length})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-32 object-cover rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                <span className="truncate">{report.address || `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ThumbsUp size={14} className="text-slate-400" />
                {report._count.confirmations} potvrdení
              </div>
              {report.user && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User size={14} className="text-slate-400" />
                  {report.isAnonymous ? "Anonymný" : report.user.name}
                </div>
              )}
              {report.user?.email && !report.isAnonymous && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  {report.user.email}
                </div>
              )}
              {report.contactEmail && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  {report.contactEmail}
                </div>
              )}
              {report.contactPhone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  {report.contactPhone}
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400">
              Vytvorené: {formatDate(report.createdAt)} | Aktualizované: {formatDate(report.updatedAt)}
            </div>
          </div>

          {/* Timeline */}
          {report.updates.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Priebeh riešenia</h3>
              <ReportTimeline updates={report.updates} />
            </div>
          )}

          {/* Admin actions log */}
          {report.adminActions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Aktivita administrátorov</h3>
              <div className="space-y-2">
                {report.adminActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 text-sm">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={12} className="text-slate-500" />
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">{action.admin.name}</span>
                      <span className="text-slate-500"> — {action.action}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{formatDate(action.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Moderation */}
        <div className="space-y-4">
          <ModerationPanel
            reportId={report.id}
            currentStatus={currentStatus}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
