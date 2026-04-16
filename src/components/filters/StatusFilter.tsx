"use client";

import { ReportStatus } from "@prisma/client";
import { STATUS_CONFIG } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusFilterProps {
  selected: ReportStatus[];
  onChange: (selected: ReportStatus[]) => void;
}

const STATUSES: ReportStatus[] = [
  "NEW",
  "UNDER_REVIEW",
  "ACCEPTED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "DUPLICATE",
];

export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const toggle = (status: ReportStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  const hasSelection = selected.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors border",
            hasSelection
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          )}
        >
          <CircleDot size={14} />
          Stav
          {hasSelection && (
            <span className="ml-0.5 h-5 min-w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center px-1">
              {selected.length}
            </span>
          )}
          <ChevronDown size={14} className="ml-0.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selected.includes(status)}
              onCheckedChange={() => toggle(status)}
              onSelect={(e) => e.preventDefault()}
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                {config.label}
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
        {hasSelection && (
          <>
            <DropdownMenuSeparator />
            <button
              onClick={() => onChange([])}
              className="w-full px-2 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium text-left rounded-md hover:bg-slate-50"
            >
              Zrušiť výber
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
