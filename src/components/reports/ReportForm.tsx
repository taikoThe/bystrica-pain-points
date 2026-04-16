"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-path";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/map/LocationPicker";
import { PhotoUpload } from "@/components/shared/PhotoUpload";
import { CATEGORIES } from "@/lib/constants";
import { getCategoryIcon } from "@/components/shared/CategoryBadge";
import { StreetSearch } from "@/components/shared/StreetSearch";
import { MapPin, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { getCityPart } from "@/lib/city-parts";
import type { Category } from "@/types";

interface ReportFormProps {
  categories: Category[];
  initialLocation?: { lat: number; lng: number } | null;
}

export function ReportForm({ categories, initialLocation }: ReportFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [nearbyReports, setNearbyReports] = useState<{ id: string; title: string; distance: number }[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    latitude: initialLocation?.lat || 0,
    longitude: initialLocation?.lng || 0,
    address: "",
    contactEmail: "",
    isAnonymous: false,
  });
  const [files, setFiles] = useState<File[]>([]);

  // Reverse geocode when location changes
  useEffect(() => {
    if (form.latitude && form.longitude) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${form.latitude}&lon=${form.longitude}&zoom=18&addressdetails=1`,
        { headers: { "User-Agent": "BystricaPainPoints/1.0" } }
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.address) {
            const a = data.address;
            const street = a.road || a.pedestrian || a.path || "";
            const cityPart = getCityPart(street);
            const parts = [
              a.house_number ? `${street} ${a.house_number}` : street,
              cityPart || a.city || a.town || a.village || "Banská Bystrica",
              a.postcode,
            ].filter(Boolean);
            setForm((f) => ({ ...f, address: parts.join(", ") }));
          } else if (data.display_name) {
            setForm((f) => ({ ...f, address: data.display_name }));
          }
        })
        .catch(() => {});

      // Check for nearby reports
      fetch(api(`/api/reports/nearby?lat=${form.latitude}&lng=${form.longitude}&radius=100`))
        .then((r) => r.json())
        .then((data) => setNearbyReports(data))
        .catch(() => {});
    }
  }, [form.latitude, form.longitude]);

  const handleLocationChange = (lat: number, lng: number) => {
    setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
  };

  const handleStreetSelect = (street: string) => {
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(street + ", Banská Bystrica")}&limit=1`,
      { headers: { "User-Agent": "BystricaPainPoints/1.0" } }
    )
      .then((r) => r.json())
      .then((results) => {
        if (results.length > 0) {
          const { lat, lon } = results[0];
          setForm((f) => ({ ...f, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
        }
      })
      .catch(() => {});
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      // Upload photos first
      const attachmentUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(api("/api/upload"), { method: "POST", body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          attachmentUrls.push(url);
        }
      }

      const res = await fetch(api("/api/reports"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attachments: attachmentUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Nepodarilo sa odoslať hlásenie");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nastala chyba");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4 rounded-full bg-emerald-100 p-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Hlásenie odoslané!</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          Ďakujeme za vaše hlásenie. Bude posúdené a zaradené do riešenia.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => router.push("/")} variant="outline">
            Späť na mapu
          </Button>
          <Button onClick={() => { setSubmitted(false); setStep(1); setForm({ title: "", description: "", categoryId: "", latitude: 0, longitude: 0, address: "", contactEmail: "", isAnonymous: false }); setFiles([]); }}>
            Nové hlásenie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          </div>
        ))}
      </div>
      <div className="text-sm text-slate-500">
        Krok {step} z 3:{" "}
        {step === 1 ? "Poloha" : step === 2 ? "Detaily" : "Kontakt a odoslanie"}
      </div>

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Kde sa problém nachádza?</Label>
            <p className="text-sm text-slate-500 mt-1">
              Kliknite na mapu alebo použite GPS pre určenie polohy.
            </p>
          </div>
          <div className="h-[350px] rounded-lg overflow-hidden border border-slate-200">
            <LocationPicker
              value={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
              onChange={handleLocationChange}
              className="h-full"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-sm font-medium">Ulica</Label>
            <p className="text-xs text-slate-500 mt-0.5 mb-1.5">Automaticky vyplnená z mapy, alebo vyhľadajte ulicu.</p>
            <StreetSearch
              value={form.address}
              onChange={(address) => setForm((f) => ({ ...f, address }))}
              onSelect={handleStreetSelect}
              placeholder="Zadajte názov ulice..."
            />
          </div>

          {nearbyReports.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
                <AlertTriangle size={16} />
                Blízke existujúce hlásenia
              </div>
              <ul className="space-y-1">
                {nearbyReports.map((r) => (
                  <li key={r.id} className="text-sm text-amber-600">
                    &bull; {r.title} ({Math.round(r.distance)}m)
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-600">
                Skontrolujte, či váš problém už nie je nahlásený. Ak áno, môžete ho potvrdiť namiesto vytvorenia duplicity.
              </p>
            </div>
          )}

          <Button
            onClick={() => setStep(2)}
            disabled={!form.latitude || !form.longitude}
            className="w-full"
            size="lg"
          >
            Pokračovať
          </Button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="category" className="text-base font-semibold">Kategória *</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Vyberte kategóriu" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.icon);
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <Icon size={14} style={{ color: cat.color }} />
                        {cat.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title" className="text-base font-semibold">Názov *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Stručný popis problému"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-semibold">Popis *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Popíšte problém podrobnejšie..."
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-base font-semibold">Fotografie</Label>
            <p className="text-sm text-slate-500 mt-1 mb-2">Pridajte fotky problému (voliteľné).</p>
            <PhotoUpload onFilesChange={setFiles} />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Späť
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!form.categoryId || !form.title || !form.description}
              className="flex-1"
            >
              Pokračovať
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Contact & Submit */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-base font-semibold">Email (voliteľné)</Label>
            <p className="text-sm text-slate-500 mt-1">Pre prípadné informácie o riešení.</p>
            <Input
              id="email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              placeholder="vas@email.sk"
              className="mt-1.5"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Odoslať anonymne</span>
          </label>

          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm text-slate-700">Súhrn hlásenia</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-medium">Kategória:</span> {categories.find((c) => c.id === form.categoryId)?.name}</p>
              <p><span className="font-medium">Názov:</span> {form.title}</p>
              {form.address && <p><span className="font-medium">Miesto:</span> {form.address.split(",").slice(0, 3).join(",")}</p>}
              {files.length > 0 && <p><span className="font-medium">Fotografie:</span> {files.length}</p>}
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={submitting}>
              Späť
            </Button>
            <Button onClick={handleSubmit} className="flex-1" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Odosielam...
                </>
              ) : (
                "Odoslať hlásenie"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
