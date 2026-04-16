"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-path";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";

const DISTRICT_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4",
];

interface DistrictProperties {
  id: number;
  name_sk: string;
  description: string;
  councilors: number;
  precincts: string;
  councilor_names: string[];
  councilor_photos: string[];
}

export function DistrictsLayer({ visible }: { visible: boolean }) {
  const map = useMap();
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch(api("/districts.geojson"))
      .then((res) => res.json())
      .then((geojson) => setData(geojson))
      .catch(() => {});
  }, []);

  if (!visible || !data) return null;

  const style = (feature: Feature<Geometry, DistrictProperties> | undefined) => {
    const idx = (feature?.properties?.id ?? 1) - 1;
    const color = DISTRICT_COLORS[idx % DISTRICT_COLORS.length];
    return {
      color,
      weight: 2,
      opacity: 0.8,
      fillColor: color,
      fillOpacity: 0.12,
      dashArray: "5 3",
    };
  };

  const onEachFeature = (feature: Feature<Geometry, DistrictProperties>, layer: L.Layer) => {
    const p = feature.properties;
    const names = p.councilor_names || [];
    const photos = p.councilor_photos || [];
    const councilorsHtml = names
      .map((name, i) => {
        const photo = photos[i];
        const imgHtml = photo
          ? `<img src="/councillors/${photo}" alt="${name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0" />`
          : `<div style="width:36px;height:36px;border-radius:50%;background:#e2e8f0;flex-shrink:0"></div>`;
        return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0">${imgHtml}<span style="font-size:12px;color:#334155">${name}</span></div>`;
      })
      .join("");

    layer.bindPopup(
      `<div style="min-width:220px;max-width:300px">
        <strong style="font-size:14px">${p.name_sk}</strong>
        <div style="color:#64748b;font-size:12px;margin-top:4px">${p.description}</div>
        <div style="margin-top:8px;font-size:12px;display:flex;flex-direction:column;gap:2px">
          <span><strong>Okrsky:</strong> ${p.precincts}</span>
        </div>
        <div style="margin-top:8px;border-top:1px solid #e2e8f0;padding-top:8px">
          <strong style="font-size:12px">Poslanci (${p.councilors}):</strong>
          <div style="margin-top:6px;display:flex;flex-direction:column;gap:2px">${councilorsHtml}</div>
        </div>
      </div>`,
      { className: "district-popup", maxWidth: 320 }
    );
    layer.on("mouseover", (e) => {
      const target = e.target as L.Path;
      target.setStyle({ fillOpacity: 0.3, weight: 3 });
    });
    layer.on("mouseout", (e) => {
      const target = e.target as L.Path;
      const idx = (p.id ?? 1) - 1;
      const color = DISTRICT_COLORS[idx % DISTRICT_COLORS.length];
      target.setStyle({ fillOpacity: 0.12, weight: 2, color });
    });
  };

  return (
    <GeoJSON
      key={visible ? "districts-on" : "districts-off"}
      data={data}
      style={style as L.StyleFunction}
      onEachFeature={onEachFeature as (feature: Feature, layer: L.Layer) => void}
    />
  );
}
