"use client";

import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { MapMarkerData } from "@/types";

interface IssueMarkerProps {
  marker: MapMarkerData;
  isSelected: boolean;
  onClick: () => void;
}

function createMarkerIcon(color: string, isSelected: boolean, isResolved: boolean): L.DivIcon {
  const opacity = isResolved ? 0.5 : 1;
  const size = isSelected ? 32 : 24;
  const borderWidth = isSelected ? 3 : 2;
  const shadow = isSelected ? "0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3)" : "0 2px 6px rgba(0,0,0,0.25)";

  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      border: ${borderWidth}px solid white;
      box-shadow: ${shadow};
      opacity: ${opacity};
      transition: all 150ms ease;
    "></div>`,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function IssueMarker({ marker, isSelected, onClick }: IssueMarkerProps) {
  const isResolved = marker.status === "RESOLVED" || marker.status === "DUPLICATE" || marker.status === "REJECTED";

  const icon = createMarkerIcon(marker.categoryColor, isSelected, isResolved);

  return (
    <Marker
      position={[marker.latitude, marker.longitude]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
        <div className="text-xs font-medium max-w-48">{marker.title}</div>
        <div className="text-xs text-slate-500">{marker.categoryName}</div>
      </Tooltip>
    </Marker>
  );
}
