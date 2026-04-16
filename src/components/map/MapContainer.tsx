"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/shared/LoadingSkeleton";
import type { MapMarkerData, MapFilters } from "@/types";

const DynamicMap = dynamic(() => import("./DynamicMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface MapContainerProps {
  markers: MapMarkerData[];
  filters: MapFilters;
  selectedMarkerId?: string | null;
  onMarkerClick: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

export function MapContainer(props: MapContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <MapSkeleton />;

  return <DynamicMap {...props} />;
}
