import { ReportStatus } from "@prisma/client";

export const CATEGORIES = [
  { slug: "potholes", name: "Výtlky a poškodené cesty", icon: "construction", color: "#EF4444" },
  { slug: "streetlights", name: "Nefunkčné osvetlenie", icon: "lightbulb-off", color: "#F59E0B" },
  { slug: "illegal-dumping", name: "Nelegálne skládky", icon: "trash-2", color: "#84CC16" },
  { slug: "graffiti", name: "Grafity a vandalizmus", icon: "spray-can", color: "#A855F7" },
  { slug: "furniture", name: "Poškodený mestský mobiliár", icon: "armchair", color: "#EC4899" },
  { slug: "sidewalks", name: "Poškodené chodníky", icon: "footprints", color: "#F97316" },
  { slug: "traffic-signs", name: "Dopravné značenie", icon: "triangle-alert", color: "#06B6D4" },
  { slug: "crossings", name: "Nebezpečné priechody", icon: "shield-alert", color: "#DC2626" },
  { slug: "greenery", name: "Verejná zeleň", icon: "tree-pine", color: "#22C55E" },
  { slug: "water-drainage", name: "Voda a kanalizácia", icon: "droplets", color: "#3B82F6" },
  { slug: "winter-maintenance", name: "Zimná údržba", icon: "snowflake", color: "#67E8F9" },
  { slug: "other", name: "Iné", icon: "circle-help", color: "#6B7280" },
] as const;

export const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  NEW: { label: "Nový", color: "#3B82F6", bgColor: "bg-blue-50", textColor: "text-blue-700" },
  UNDER_REVIEW: { label: "Posudzovaný", color: "#8B5CF6", bgColor: "bg-purple-50", textColor: "text-purple-700" },
  ACCEPTED: { label: "Prijatý", color: "#06B6D4", bgColor: "bg-cyan-50", textColor: "text-cyan-700" },
  IN_PROGRESS: { label: "V riešení", color: "#F59E0B", bgColor: "bg-amber-50", textColor: "text-amber-700" },
  RESOLVED: { label: "Vyriešený", color: "#10B981", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
  REJECTED: { label: "Zamietnutý", color: "#F43F5E", bgColor: "bg-rose-50", textColor: "text-rose-700" },
  DUPLICATE: { label: "Duplicitný", color: "#6B7280", bgColor: "bg-gray-50", textColor: "text-gray-700" },
};

export const SEVERITY_CONFIG = {
  LOW: { label: "Nízka", color: "#22C55E" },
  MEDIUM: { label: "Stredná", color: "#F59E0B" },
  HIGH: { label: "Vysoká", color: "#F97316" },
  CRITICAL: { label: "Kritická", color: "#EF4444" },
} as const;

export const MAP_CONFIG = {
  center: {
    lat: parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT || "48.7364"),
    lng: parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG || "19.1461"),
  },
  defaultZoom: parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM || "14"),
  minZoom: 10,
  maxZoom: 19,
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Bystrica Pain Points";
