"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BarChart3, Tags, MapPin, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reports", label: "Hlásenia", icon: FileText },
  { href: "/admin/analytics", label: "Analytika", icon: BarChart3 },
  { href: "/admin/categories", label: "Kategórie", icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} />
          Späť na mapu
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <MapPin size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Admin Panel</div>
            <div className="text-xs text-slate-500">Bystrica Pain Points</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-white hover:text-slate-800"
              )}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
