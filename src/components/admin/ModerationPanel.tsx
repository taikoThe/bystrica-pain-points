"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReportStatus } from "@prisma/client";
import { STATUS_CONFIG } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface ModerationPanelProps {
  reportId: string;
  currentStatus: ReportStatus;
  onStatusChange: (status: ReportStatus, note: string) => Promise<void>;
}

const STATUSES: ReportStatus[] = [
  "NEW", "UNDER_REVIEW", "ACCEPTED", "IN_PROGRESS", "RESOLVED", "REJECTED", "DUPLICATE",
];

export function ModerationPanel({ reportId, currentStatus, onStatusChange }: ModerationPanelProps) {
  const [newStatus, setNewStatus] = useState<ReportStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onStatusChange(newStatus, note);
      setNote("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
      <h3 className="font-semibold text-slate-800">Moderácia</h3>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">Aktuálny stav:</span>
        <StatusBadge status={currentStatus} size="md" />
      </div>

      <div className="space-y-2">
        <Label>Nový stav</Label>
        <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ReportStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_CONFIG[status].color }}
                  />
                  {STATUS_CONFIG[status].label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Poznámka (verejná)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Poznámka k zmene stavu..."
          rows={3}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || (newStatus === currentStatus && !note)}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Ukladám...
          </>
        ) : (
          "Uložiť zmenu"
        )}
      </Button>
    </div>
  );
}
