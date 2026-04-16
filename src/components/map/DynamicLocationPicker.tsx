"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CONFIG } from "@/lib/constants";
import { LocateFixed } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pinIcon = L.divIcon({
  html: `<div style="
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    background: #2563EB;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "><div style="
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  "></div></div>`,
  className: "custom-pin",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface DynamicLocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function LocateButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 17 });
    map.once("locationfound", (e) => {
      onLocate(e.latlng.lat, e.latlng.lng);
      setLocating(false);
    });
    map.once("locationerror", () => setLocating(false));
  };

  return (
    <button
      type="button"
      onClick={handleLocate}
      className={`absolute bottom-4 right-4 z-[1000] h-10 w-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-slate-50 border border-slate-200 ${locating ? "animate-pulse" : ""}`}
      aria-label="Použiť moju polohu"
    >
      <LocateFixed size={18} className={locating ? "text-blue-600" : "text-slate-700"} />
    </button>
  );
}

function FlyToValue({ value }: { value?: { lat: number; lng: number } | null }) {
  const map = useMap();
  const prevValue = useRef(value);

  useEffect(() => {
    if (
      value &&
      (value.lat !== prevValue.current?.lat || value.lng !== prevValue.current?.lng)
    ) {
      map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 16), { duration: 0.5 });
    }
    prevValue.current = value;
  }, [value, map]);

  return null;
}

export default function DynamicLocationPicker({ value, onChange, className }: DynamicLocationPickerProps) {
  return (
    <div className={`relative ${className}`}>
      <style>{`.leaflet-container { width: 100%; height: 100%; cursor: crosshair !important; }`}</style>
      <MapContainer
        center={value ? [value.lat, value.lng] : [MAP_CONFIG.center.lat, MAP_CONFIG.center.lng]}
        zoom={value ? 17 : MAP_CONFIG.defaultZoom}
        className="w-full h-full rounded-lg"
        zoomControl={false}
      >
        <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.attribution} />
        <ClickHandler onChange={onChange} />
        <FlyToValue value={value} />
        <LocateButton onLocate={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
      </MapContainer>
      {!value && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm text-sm text-slate-600 pointer-events-none">
          Kliknite na mapu pre výber polohy
        </div>
      )}
    </div>
  );
}
