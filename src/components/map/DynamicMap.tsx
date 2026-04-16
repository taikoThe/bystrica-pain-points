"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MAP_CONFIG } from "@/lib/constants";
import { IssueMarker } from "./IssueMarker";
import { MapControls } from "./MapControls";
import { DistrictsLayer } from "./DistrictsLayer";
import type { MapMarkerData, MapFilters } from "@/types";

// Fix Leaflet default marker icon path issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface DynamicMapProps {
  markers: MapMarkerData[];
  filters: MapFilters;
  selectedMarkerId?: string | null;
  onMarkerClick: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (!onMapClick) return;
      // Only fire when clicking directly on map tiles, not on controls, markers, or overlays
      const target = e.originalEvent.target as HTMLElement;
      const isTileClick =
        target.closest(".leaflet-tile-pane") !== null ||
        target.classList.contains("leaflet-container");
      if (isTileClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function FlyToSelected({ selectedMarkerId, markers }: { selectedMarkerId?: string | null; markers: MapMarkerData[] }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedMarkerId && selectedMarkerId !== prevId.current) {
      const marker = markers.find((m) => m.id === selectedMarkerId);
      if (marker) {
        map.flyTo([marker.latitude, marker.longitude], Math.max(map.getZoom(), 16), {
          duration: 0.5,
        });
      }
    }
    prevId.current = selectedMarkerId ?? null;
  }, [selectedMarkerId, markers, map]);

  return null;
}

export default function DynamicMap({
  markers,
  filters,
  selectedMarkerId,
  onMarkerClick,
  onMapClick,
  className,
}: DynamicMapProps) {
  const [showDistricts, setShowDistricts] = useState(false);

  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      if (filters.categories.length > 0 && !filters.categories.includes(marker.categorySlug)) {
        return false;
      }
      if (filters.statuses.length > 0 && !filters.statuses.includes(marker.status)) {
        return false;
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return marker.title.toLowerCase().includes(search);
      }
      return true;
    });
  }, [markers, filters]);

  const createClusterIcon = (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    let size = "small";
    if (count >= 50) size = "large";
    else if (count >= 10) size = "medium";

    return L.divIcon({
      html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
      className: "custom-cluster",
      iconSize: L.point(40, 40),
    });
  };

  return (
    <div className={className}>
      <style>{`
        .custom-cluster .cluster-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-weight: 600;
          font-size: 14px;
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .cluster-small { background: rgba(59, 130, 246, 0.85); }
        .cluster-medium { background: rgba(245, 158, 11, 0.85); }
        .cluster-large { background: rgba(239, 68, 68, 0.85); }
        .leaflet-container { width: 100%; height: 100%; }
      `}</style>
      <MapContainer
        center={[MAP_CONFIG.center.lat, MAP_CONFIG.center.lng]}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="w-full h-full rounded-none"
        zoomControl={false}
      >
        <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.attribution} />
        <DistrictsLayer visible={showDistricts} />
        <MapControls showDistricts={showDistricts} onToggleDistricts={() => setShowDistricts((v) => !v)} />
        <MapClickHandler onMapClick={onMapClick} />
        <FlyToSelected selectedMarkerId={selectedMarkerId} markers={filteredMarkers} />
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {filteredMarkers.map((marker) => (
            <IssueMarker
              key={marker.id}
              marker={marker}
              isSelected={marker.id === selectedMarkerId}
              onClick={() => onMarkerClick(marker.id)}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
