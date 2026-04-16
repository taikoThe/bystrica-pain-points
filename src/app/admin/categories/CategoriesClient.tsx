"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string | null;
  sortOrder: number;
  _count: { reports: number };
}

interface FormData {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  sortOrder: number;
}

const emptyForm: FormData = {
  name: "",
  slug: "",
  icon: "circle-help",
  color: "#6B7280",
  description: "",
  sortOrder: 0,
};

const AVAILABLE_ICONS = [
  "construction", "lightbulb-off", "trash-2", "spray-can", "armchair",
  "footprints", "triangle-alert", "shield-alert", "tree-pine", "droplets",
  "snowflake", "circle-help",
];

export function CategoriesClient({ categories }: { categories: CategoryWithCount[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editingId ? f.slug : generateSlug(name),
    }));
  };

  const startAdd = () => {
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder), 0);
    setForm({ ...emptyForm, sortOrder: maxOrder + 1 });
    setShowAddForm(true);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (cat: CategoryWithCount) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      color: cat.color,
      description: cat.description || "",
      sortOrder: cat.sortOrder,
    });
    setEditingId(cat.id);
    setShowAddForm(false);
    setError(null);
  };

  const cancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setError(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    const url = editingId
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories";

    try {
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Uloženie zlyhalo");
        return;
      }

      cancel();
      router.refresh();
    } catch {
      setError("Uloženie zlyhalo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryWithCount) => {
    if (!confirm(`Naozaj chcete vymazať kategóriu "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Vymazanie zlyhalo");
        return;
      }
      router.refresh();
    } catch {
      alert("Vymazanie zlyhalo");
    }
  };

  const renderForm = () => (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardContent className="pt-6 space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Názov</Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Napr. Hluk"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="napr. hluk"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-icon">Ikona</Label>
            <select
              id="cat-icon"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {AVAILABLE_ICONS.map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-color">Farba</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
              />
              <Input
                id="cat-color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                placeholder="#6B7280"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-order">Poradie</Label>
            <Input
              id="cat-order"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-desc">Popis (voliteľný)</Label>
          <Input
            id="cat-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Krátky popis kategórie"
          />
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-sm text-slate-500">Náhľad:</span>
          <CategoryBadge name={form.name || "Názov"} icon={form.icon} color={form.color} size="md" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save size={14} className="mr-1.5" />
            {saving ? "Ukladám..." : editingId ? "Uložiť zmeny" : "Vytvoriť"}
          </Button>
          <Button onClick={cancel} variant="outline" size="sm">
            <X size={14} className="mr-1.5" />
            Zrušiť
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kategórie</h1>
          <p className="text-sm text-slate-500 mt-1">Správa kategórií hlásení</p>
        </div>
        {!showAddForm && !editingId && (
          <Button onClick={startAdd}>
            <Plus size={16} className="mr-1.5" />
            Pridať kategóriu
          </Button>
        )}
      </div>

      {showAddForm && renderForm()}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id}>
            {editingId === cat.id ? (
              renderForm()
            ) : (
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CategoryBadge
                      name={cat.name}
                      icon={cat.icon}
                      color={cat.color}
                      size="md"
                    />
                    <span className="text-sm font-medium text-slate-500">
                      {cat._count.reports} hlásení
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Slug:</span>
                      <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{cat.slug}</code>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Ikona:</span>
                      <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{cat.icon}</code>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Farba:</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
                        <code className="text-xs">{cat.color}</code>
                      </div>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Poradie:</span>
                      <span>{cat.sortOrder}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <Button variant="outline" size="sm" onClick={() => startEdit(cat)} className="flex-1">
                      <Pencil size={14} className="mr-1.5" />
                      Upraviť
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cat)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={cat._count.reports > 0}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
