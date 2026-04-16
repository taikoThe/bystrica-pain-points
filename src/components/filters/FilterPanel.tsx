"use client";

import { CategoryFilter } from "./CategoryFilter";
import { StatusFilter } from "./StatusFilter";
import { X } from "lucide-react";
import type { MapFilters } from "@/types";
import type { Category, ReportStatus } from "@prisma/client";

interface FilterPanelProps {
  filters: MapFilters;
  categories: Category[];
  onFiltersChange: (filters: MapFilters) => void;
  onClose?: () => void;
  reportCount?: number;
}

export function FilterPanel({ filters, categories, onFiltersChange, onClose, reportCount }: FilterPanelProps) {
  const hasFilters = filters.categories.length > 0 || filters.statuses.length > 0;

  const clearAll = () => {
    onFiltersChange({ ...filters, categories: [], statuses: [] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryFilter
            categories={categories}
            selected={filters.categories}
            onChange={(categories) => onFiltersChange({ ...filters, categories })}
          />
          <StatusFilter
            selected={filters.statuses}
            onChange={(statuses) => onFiltersChange({ ...filters, statuses })}
          />
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-1">
              Zrušiť všetko
            </button>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={16} className="text-slate-500" />
          </button>
        )}
      </div>

      {reportCount !== undefined && (
        <div className="text-sm text-slate-500">
          {reportCount} {reportCount === 1 ? "hlásenie" : reportCount < 5 ? "hlásenia" : "hlásení"}
        </div>
      )}
    </div>
  );
}
