"use client";

import { useSearchParams } from "next/navigation";
import { ReportForm } from "@/components/reports/ReportForm";
import type { Category } from "@prisma/client";

interface NewReportContentProps {
  categories: Category[];
}

export function NewReportContent({ categories }: NewReportContentProps) {
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const initialLocation =
    lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

  return <ReportForm categories={categories} initialLocation={initialLocation} />;
}
