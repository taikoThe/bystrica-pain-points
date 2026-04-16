"use client";

import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NearbyReport {
  id: string;
  title: string;
  distance: number;
}

interface NearbyDuplicatesProps {
  reports: NearbyReport[];
}

export function NearbyDuplicates({ reports }: NearbyDuplicatesProps) {
  if (reports.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-700 font-medium">
        <AlertTriangle size={16} />
        <span>Blízke existujúce hlásenia</span>
      </div>
      <ul className="space-y-2">
        {reports.map((report) => (
          <li key={report.id}>
            <Link
              href={`/report/${report.id}`}
              className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800"
            >
              <ExternalLink size={12} />
              <span className="flex-1">{report.title}</span>
              <span className="text-xs text-amber-500">{Math.round(report.distance)}m</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-amber-600">
        Ak sa váš problém zhoduje s niektorým z uvedených, môžete ho potvrdiť namiesto vytvárania nového hlásenia.
      </p>
    </div>
  );
}
