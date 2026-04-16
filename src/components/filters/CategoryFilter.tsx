"use client";

import { getCategoryIcon } from "@/components/shared/CategoryBadge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";

interface CategoryFilterProps {
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  const hasSelection = selected.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors border",
            hasSelection
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          )}
        >
          <Layers size={14} />
          Kategória
          {hasSelection && (
            <span className="ml-0.5 h-5 min-w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center px-1">
              {selected.length}
            </span>
          )}
          <ChevronDown size={14} className="ml-0.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          return (
            <DropdownMenuCheckboxItem
              key={cat.id}
              checked={selected.includes(cat.slug)}
              onCheckedChange={() => toggle(cat.slug)}
              onSelect={(e) => e.preventDefault()}
            >
              <span className="flex items-center gap-2">
                <Icon size={14} style={{ color: cat.color }} />
                {cat.name}
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
        {hasSelection && (
          <>
            <DropdownMenuSeparator />
            <button
              onClick={() => onChange([])}
              className="w-full px-2 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium text-left rounded-md hover:bg-slate-50"
            >
              Zrušiť výber
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
