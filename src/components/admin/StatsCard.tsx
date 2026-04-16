import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; label: string };
  color?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, description, trend, color = "#3B82F6", className }: StatsCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {description && <p className="text-xs text-slate-400">{description}</p>}
            {trend && (
              <p className={`text-xs font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
