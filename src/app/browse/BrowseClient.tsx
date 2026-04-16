"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "@/components/filters/SearchBar";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import { StatusFilter } from "@/components/filters/StatusFilter";
import { ReportList } from "@/components/reports/ReportList";
import type { ReportListItem, MapFilters } from "@/types";
import type { Category } from "@prisma/client";

interface BrowseClientProps {
  reports: ReportListItem[];
  categories: Category[];
}

export function BrowseClient({ reports, categories }: BrowseClientProps) {
  const [filters, setFilters] = useState<MapFilters>({
    categories: [],
    statuses: [],
    search: "",
  });

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (filters.categories.length > 0 && !filters.categories.includes(r.category.slug)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(r.status)) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        return (
          r.title.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s) ||
          (r.address?.toLowerCase().includes(s) ?? false)
        );
      }
      return true;
    });
  }, [reports, filters]);

  return (
    <div className="space-y-4">
      <SearchBar
        value={filters.search}
        onChange={(search) => setFilters((f) => ({ ...f, search }))}
        placeholder="Hľadať v hláseniach..."
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-72 shrink-0 space-y-4">
          <CategoryFilter
            categories={categories}
            selected={filters.categories}
            onChange={(categories) => setFilters((f) => ({ ...f, categories }))}
          />
          <StatusFilter
            selected={filters.statuses}
            onChange={(statuses) => setFilters((f) => ({ ...f, statuses }))}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm text-slate-500 mb-3">
            {filtered.length} {filtered.length === 1 ? "hlásenie" : "hlásení"}
          </div>
          <ReportList reports={filtered} />
        </div>
      </div>
    </div>
  );
}
