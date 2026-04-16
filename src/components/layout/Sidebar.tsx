"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-80 border-r border-slate-200 bg-white shrink-0",
        className
      )}
    >
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </aside>
  );
}
