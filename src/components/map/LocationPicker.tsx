"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/shared/LoadingSkeleton";

const DynamicLocationPicker = dynamic(() => import("./DynamicLocationPicker"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export function LocationPicker(props: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <MapSkeleton />;

  return <DynamicLocationPicker {...props} />;
}
