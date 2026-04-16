"use client";

import { useState, useMemo } from "react";
import { api } from "@/lib/api-path";
import { useRouter } from "next/navigation";
import { MapContainer } from "@/components/map/MapContainer";
import { MapSearch } from "@/components/map/MapSearch";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchBar } from "@/components/filters/SearchBar";
import { ReportList } from "@/components/reports/ReportList";
import { ReportDetail } from "@/components/reports/ReportDetail";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Plus, Filter, List, Map as MapIcon, X } from "lucide-react";
import type { MapMarkerData, ReportListItem, MapFilters, ReportWithRelations } from "@/types";
import type { Category } from "@prisma/client";

interface HomePageClientProps {
  markers: MapMarkerData[];
  reports: ReportListItem[];
  categories: Category[];
  user: { id: string; name: string | null; role: string } | null;
}

export function HomePageClient({ markers, reports, categories, user }: HomePageClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<MapFilters>({
    categories: [],
    statuses: [],
    search: "",
  });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportWithRelations | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [mapSearchLocation, setMapSearchLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filters.categories.length > 0 && !filters.categories.includes(r.category.slug)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(r.status)) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        return r.title.toLowerCase().includes(s) || (r.address?.toLowerCase().includes(s) ?? false);
      }
      return true;
    });
  }, [reports, filters]);

  const handleMarkerClick = async (id: string) => {
    setSelectedReportId(id);
    setDetailOpen(true);
    try {
      const res = await fetch(api(`/api/reports/${id}`));
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data);
      }
    } catch {
      // silently fail
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    router.push(`/report/new?lat=${lat}&lng=${lng}`);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedReportId(null);
    setSelectedReport(null);
    setIsConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!selectedReport) return;
    try {
      const res = await fetch(api(`/api/reports/${selectedReport.id}/confirm`), { method: "POST" });
      if (res.ok) {
        setIsConfirmed(true);
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header user={user} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop sidebar */}
        <Sidebar>
          <div className="space-y-4">
            <SearchBar
              value={filters.search}
              onChange={(search) => setFilters((f) => ({ ...f, search }))}
              placeholder="Hľadať hlásenia..."
            />
            <FilterPanel
              filters={filters}
              categories={categories}
              onFiltersChange={setFilters}
              reportCount={filteredReports.length}
            />
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Posledné hlásenia</h3>
              <ReportList
                reports={filteredReports.slice(0, 10)}
                compact
                onReportClick={handleMarkerClick}
              />
            </div>
          </div>
        </Sidebar>

        {/* Main map area */}
        <div className="flex-1 relative">
          {/* Map */}
          <div className={`w-full h-full ${mobileView === "list" ? "hidden lg:block" : ""}`}>
            <MapContainer
              markers={markers}
              filters={filters}
              selectedMarkerId={selectedReportId}
              onMarkerClick={handleMarkerClick}
              onMapClick={handleMapClick}
              className="w-full h-full"
            />
          </div>

          {/* Mobile list view */}
          {mobileView === "list" && (
            <div className="lg:hidden h-full overflow-y-auto bg-slate-50 p-4">
              <ReportList
                reports={filteredReports}
                onReportClick={(id) => {
                  setMobileView("map");
                  handleMarkerClick(id);
                }}
              />
            </div>
          )}

          {/* Floating search bar (on map) */}
          <div className="absolute top-4 left-4 right-16 z-[1000] lg:hidden">
            <MapSearch
              onSelectLocation={(lat, lng) => setMapSearchLocation({ lat, lng })}
            />
          </div>

          {/* Mobile controls */}
          <div className="absolute bottom-6 left-4 right-4 z-[1000] lg:hidden flex items-end justify-between pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              {/* Filter button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="h-11 px-4 rounded-full bg-white shadow-lg flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200"
              >
                <Filter size={14} />
                Filtre
                {(filters.categories.length > 0 || filters.statuses.length > 0) && (
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                    {filters.categories.length + filters.statuses.length}
                  </span>
                )}
              </button>

              {/* Map/List toggle */}
              <button
                onClick={() => setMobileView(mobileView === "map" ? "list" : "map")}
                className="h-11 px-4 rounded-full bg-white shadow-lg flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200"
              >
                {mobileView === "map" ? <List size={14} /> : <MapIcon size={14} />}
                {mobileView === "map" ? "Zoznam" : "Mapa"}
              </button>
            </div>

            {/* Report button */}
            <Button
              onClick={() => router.push("/report/new")}
              size="lg"
              className="pointer-events-auto h-12 px-5 rounded-full shadow-xl"
            >
              <Plus size={18} className="mr-1.5" />
              Nahlásiť
            </Button>
          </div>

          {/* Desktop report button */}
          <div className="hidden lg:block absolute bottom-6 right-6 z-[1000]">
            <Button
              onClick={() => router.push("/report/new")}
              size="lg"
              className="h-12 px-6 rounded-full shadow-xl"
            >
              <Plus size={18} className="mr-2" />
              Nahlásiť problém
            </Button>
          </div>
        </div>

        {/* Detail drawer - desktop */}
        <Sheet open={detailOpen && !!selectedReport} onOpenChange={handleCloseDetail}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden">
            <VisuallyHidden>
              <SheetTitle>Detail hlásenia</SheetTitle>
            </VisuallyHidden>
            {selectedReport ? (
              <ReportDetail
                report={selectedReport}
                onBack={handleCloseDetail}
                onConfirm={handleConfirm}
                isConfirmed={isConfirmed}
                confirmCount={(selectedReport._count?.confirmations || selectedReport.confirmations.length) + (isConfirmed ? 1 : 0)}
              />
            ) : (
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle>Načítavanie...</SheetTitle>
                  <SheetDescription>Načítavanie detailov hlásenia</SheetDescription>
                </SheetHeader>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Mobile filter bottom sheet */}
        <BottomSheet
          open={mobileFilterOpen}
          onOpenChange={setMobileFilterOpen}
          title="Filtre"
        >
          <FilterPanel
            filters={filters}
            categories={categories}
            onFiltersChange={setFilters}
            onClose={() => setMobileFilterOpen(false)}
            reportCount={filteredReports.length}
          />
        </BottomSheet>
      </div>
    </div>
  );
}
