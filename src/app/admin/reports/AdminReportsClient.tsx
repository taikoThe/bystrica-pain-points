"use client";

import { useState, useMemo } from "react";
import { ReportTable } from "@/components/admin/ReportTable";
import { SearchBar } from "@/components/filters/SearchBar";
import { StatusFilter } from "@/components/filters/StatusFilter";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import type { ReportListItem, MapFilters } from "@/types";
import type { Category } from "@prisma/client";

interface AdminReportsClientProps {
  reports: ReportListItem[];
  categories: Category[];
}

export function AdminReportsClient({ reports, categories }: AdminReportsClientProps) {
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
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <SearchBar
          value={filters.search}
          onChange={(search) => setFilters((f) => ({ ...f, search }))}
          placeholder="Hľadať v hláseniach..."
        />
        <div className="flex flex-wrap gap-4">
          <StatusFilter
            selected={filters.statuses}
            onChange={(statuses) => setFilters((f) => ({ ...f, statuses }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="text-sm text-slate-500 mb-4">{filtered.length} hlásení</div>
        <ReportTable reports={filtered} />
      </div>
    </div>
  );
}
