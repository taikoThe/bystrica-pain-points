"use client";

import { useMap } from "react-leaflet";
import { Plus, Minus, LocateFixed, Map as MapIcon } from "lucide-react";
import { useState } from "react";

interface MapControlsProps {
  showDistricts: boolean;
  onToggleDistricts: () => void;
}

export function MapControls({ showDistricts, onToggleDistricts }: MapControlsProps) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 17 });
    map.once("locationfound", () => setLocating(false));
    map.once("locationerror", () => setLocating(false));
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="h-10 w-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200"
        aria-label="Priblížiť"
      >
        <Plus size={18} className="text-slate-700" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="h-10 w-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200"
        aria-label="Oddialiť"
      >
        <Minus size={18} className="text-slate-700" />
      </button>
      <button
        onClick={handleLocate}
        className={`h-10 w-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200 ${locating ? "animate-pulse" : ""}`}
        aria-label="Moja poloha"
      >
        <LocateFixed size={18} className={locating ? "text-blue-600" : "text-slate-700"} />
      </button>
      <button
        onClick={onToggleDistricts}
        className={`h-10 w-10 rounded-lg shadow-md flex items-center justify-center transition-colors border ${
          showDistricts
            ? "bg-blue-50 border-blue-200 text-blue-600"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
        aria-label="Zobraziť obvody"
        title="Volebné obvody"
      >
        <MapIcon size={18} />
      </button>
    </div>
  );
}
