import { cn } from "@/lib/utils";
import {
  Construction, LightbulbOff, Trash2, SprayCan, Armchair, Footprints,
  TriangleAlert, ShieldAlert, TreePine, Droplets, Snowflake, CircleHelp,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "construction": Construction,
  "lightbulb-off": LightbulbOff,
  "trash-2": Trash2,
  "spray-can": SprayCan,
  "armchair": Armchair,
  "footprints": Footprints,
  "triangle-alert": TriangleAlert,
  "shield-alert": ShieldAlert,
  "tree-pine": TreePine,
  "droplets": Droplets,
  "snowflake": Snowflake,
  "circle-help": CircleHelp,
};

interface CategoryBadgeProps {
  name: string;
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function CategoryBadge({ name, icon, color, size = "sm", showLabel = true, className }: CategoryBadgeProps) {
  const IconComponent = iconMap[icon] || CircleHelp;

  const iconSize = size === "lg" ? 18 : size === "md" ? 16 : 14;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        size === "lg" && "px-3 py-1.5 text-sm",
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <IconComponent size={iconSize} />
      {showLabel && name}
    </span>
  );
}

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || CircleHelp;
}
