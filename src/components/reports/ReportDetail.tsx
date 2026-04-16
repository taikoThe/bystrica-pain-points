"use client";

import { useState } from "react";
import { MapPin, Clock, ThumbsUp, User, ChevronLeft, Share2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { ReportTimeline } from "./ReportTimeline";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { ReportWithRelations } from "@/types";

interface ReportDetailProps {
  report: ReportWithRelations;
  onBack?: () => void;
  onConfirm?: () => void;
  isConfirmed?: boolean;
  confirmCount: number;
}

export function ReportDetail({ report, onBack, onConfirm, isConfirmed, confirmCount }: ReportDetailProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const photos = report.attachments.filter((a) => a.mimeType.startsWith("image/"));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-slate-100">
        {onBack && (
          <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={report.status} size="md" />
            <CategoryBadge
              name={report.category.name}
              icon={report.category.icon}
              color={report.category.color}
              size="sm"
            />
          </div>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Share2 size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{report.title}</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{report.description}</p>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <ImageIcon size={14} />
              <span>Fotografie ({photos.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(showAllPhotos ? photos : photos.slice(0, 4)).map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.filename}
                  className="w-full h-32 object-cover rounded-lg border border-slate-200"
                />
              ))}
            </div>
            {photos.length > 4 && !showAllPhotos && (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Zobraziť všetky ({photos.length})
              </button>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <span>{report.address || `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}</span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatDate(report.createdAt)}</span>
          </div>
          {report.user && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{report.isAnonymous ? "Anonymný" : report.user.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <ThumbsUp size={12} />
            <span>{confirmCount} potvrdení</span>
          </div>
        </div>

        {/* Confirm button */}
        {report.status !== "RESOLVED" && report.status !== "REJECTED" && report.status !== "DUPLICATE" && (
          <Button
            variant={isConfirmed ? "secondary" : "outline"}
            size="sm"
            onClick={onConfirm}
            disabled={isConfirmed}
            className="w-full"
          >
            <ThumbsUp size={14} className="mr-2" />
            {isConfirmed ? "Potvrdené" : "Mám rovnaký problém"}
          </Button>
        )}

        {/* Timeline */}
        {report.updates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">Priebeh riešenia</h3>
            <ReportTimeline updates={report.updates} />
          </div>
        )}
      </div>
    </div>
  );
}
