import { formatRelativeDate } from "@/lib/utils";
import type { ReportUpdate } from "@/types";

interface ReportTimelineProps {
  updates: ReportUpdate[];
}

export function ReportTimeline({ updates }: ReportTimelineProps) {
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-0">
      {sortedUpdates.map((update, index) => (
        <div key={update.id} className="relative flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
            {index < sortedUpdates.length - 1 && (
              <div className="w-px flex-1 bg-slate-200 my-1" />
            )}
          </div>
          {/* Content */}
          <div className="pb-4 flex-1 min-w-0">
            <p className="text-sm text-slate-700">{update.content}</p>
            <p className="text-xs text-slate-400 mt-1">
              {formatRelativeDate(update.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
