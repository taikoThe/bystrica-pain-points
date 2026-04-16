"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface StreetSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (street: string) => void;
  placeholder?: string;
}

export function StreetSearch({ value, onChange, onSelect, placeholder = "Zadajte názov ulice..." }: StreetSearchProps) {
  const [streets, setStreets] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/streets.json")
      .then((r) => r.json())
      .then((data) => setStreets(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const query = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matches = streets.filter((s) => {
      const normalized = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalized.includes(query);
    });
    setSuggestions(matches.slice(0, 8));
    setOpen(matches.length > 0);
    setActiveIndex(-1);
  }, [value, streets]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const select = (street: string) => {
    onChange(street);
    onSelect?.(street);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
          {suggestions.map((street, i) => (
            <li
              key={street}
              onClick={() => select(street)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${
                i === activeIndex ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <MapPin size={12} className="shrink-0 text-slate-400" />
              {street}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
