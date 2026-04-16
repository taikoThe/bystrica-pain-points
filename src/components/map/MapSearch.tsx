"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { GeocodingResult } from "@/lib/geocoding";

interface MapSearchProps {
  onSelectLocation: (lat: number, lng: number) => void;
  className?: string;
}

export function MapSearch({ onSelectLocation, className }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q + ", Banská Bystrica"
        )}&limit=5`,
        { headers: { "User-Agent": "BystricaPainPoints/1.0" } }
      );
      const data = await res.json();
      setResults(
        data.map((item: { display_name: string; lat: string; lon: string }) => ({
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }))
      );
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => search(value), 400);
  };

  const handleSelect = (result: GeocodingResult) => {
    onSelectLocation(result.lat, result.lon);
    setQuery(result.displayName.split(",")[0]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Hľadať adresu, ulicu..."
          className="pl-9 pr-8 bg-white/95 backdrop-blur-sm shadow-lg border-0 h-11"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors text-sm border-b border-slate-50 last:border-0"
            >
              <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <span className="text-slate-700 line-clamp-2">{result.displayName}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-slate-200 p-3 text-sm text-slate-500 text-center">
          Hľadám...
        </div>
      )}
    </div>
  );
}
