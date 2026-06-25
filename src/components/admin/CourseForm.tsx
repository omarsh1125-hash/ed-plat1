"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Input, Textarea, Select, Label, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/admin/FileUpload";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

type Pair = { en: string; ar: string };
type Category = { id: string; nameEn: string; nameAr: string };

export type CourseFormData = {
  id?: string;
  titleEn: string;
  titleAr: string;
  shortDescEn: string;
  shortDescAr: string;
  descriptionEn: string;
  descriptionAr: string;
  thumbnailUrl: string;
  promoVideoUrl: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  durationMinutes: number;
  instructorName: string;
  isFree: boolean;
  price: number;
  currency: string;
  categoryId: string;
  featured: boolean;
  objectives: Pair[];
  requirements: Pair[];
};

const empty: CourseFormData = {
  titleEn: "", titleAr: "", shortDescEn: "", shortDescAr: "",
  descriptionEn: "", descriptionAr: "", thumbnailUrl: "", promoVideoUrl: "",
  level: "BEGINNER", status: "DRAFT", durationMinutes: 0, instructorName: "",
  isFree: true, price: 0, currency: "USD", categoryId: "", featured: false,
  objectives: [], requirements: [],
};

export function CourseForm({
  locale,
  dict,
  categories,
  initial,
}: {
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
  initial?: CourseFormData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<CourseFormData>(initial ?? empty);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const set = <K extends keyof CourseFormData>(k: K, v: CourseFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function setList(key: "objectives" | "requirements", i: number, side: "en" | "ar", value: string) {
    setForm((f) => {
      const arr = [...f[key]];
      arr[i] = { ...arr[i], [side]: value };
      return { ...f, [key]: arr };
    });
  }
  function addItem(key: "objectives" | "requirements") {
    setForm((f) => ({ ...f, [key]: [...f[key], { en: "", ar: "" }] }));
  }
  function removeItem(key: "objectives" | "requirements", i: number) {
    setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));
  }

  async function submit() {
    setSaving(true);
    setError("");
    setMsg("");
    const payload = {
      ...form,
      objectives: form.objectives.filter((o) => o.en || o.ar),
      requirements: form.requirements.filter((o) => o.en || o.ar),
    };
    const res = await fetch(
      initial?.id ? `/api/admin/courses/${initial.id}` : "/api/admin/courses",
      {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (!res.ok) return setError(dict.common.errorGeneric);
    const data = await res.json();
    setMsg(dict.admin.savedSuccess);
    if (!initial?.id) {
      router.push(`/${locale}/admin/courses/${data.data.id}`);
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Language tabs */}
      <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1">
        {(["en", "ar"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium",
              lang === l ? "bg-brand-600 text-white" : "text-ink-600"
            )}
          >
            {l === "en" ? dict.admin.english : dict.admin.arabic}
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
      {msg && <div className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{msg}</div>}

      {/* Bilingual content */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-semibold">{lang === "en" ? dict.admin.english : dict.admin.arabic}</h2>
        <div className="space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>
          {lang === "en" ? (
            <>
              <div><Label>{dict.admin.courseTitle}</Label><Input value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} /></div>
              <div><Label>{dict.courses.subtitle}</Label><Input value={form.shortDescEn} onChange={(e) => set("shortDescEn", e.target.value)} /></div>
              <div><Label>{dict.course.overview}</Label><Textarea className="min-h-[140px]" value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} /></div>
            </>
          ) : (
            <>
              <div><Label>{dict.admin.courseTitle}</Label><Input value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} /></div>
              <div><Label>{dict.courses.subtitle}</Label><Input value={form.shortDescAr} onChange={(e) => set("shortDescAr", e.target.value)} /></div>
              <div><Label>{dict.course.overview}</Label><Textarea className="min-h-[140px]" value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} /></div>
            </>
          )}
        </div>
      </section>

      {/* Basic info */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-semibold">{dict.admin.basicInfo}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{dict.courses.category}</Label>
            <Select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{dict.courses.level}</Label>
            <Select value={form.level} onChange={(e) => set("level", e.target.value as CourseFormData["level"])}>
              <option value="BEGINNER">{dict.courses.level_BEGINNER}</option>
              <option value="INTERMEDIATE">{dict.courses.level_INTERMEDIATE}</option>
              <option value="ADVANCED">{dict.courses.level_ADVANCED}</option>
            </Select>
          </div>
          <div>
            <Label>{dict.course.instructor}</Label>
            <Input value={form.instructorName} onChange={(e) => set("instructorName", e.target.value)} />
          </div>
          <div>
            <Label>{dict.course.duration} ({dict.common.minutes})</Label>
            <Input type="number" min={0} value={form.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} />
          </div>
          <div>
            <Label>{dict.common.status}</Label>
            <Select value={form.status} onChange={(e) => set("status", e.target.value as CourseFormData["status"])}>
              <option value="DRAFT">{dict.admin.draft}</option>
              <option value="PUBLISHED">{dict.admin.published}</option>
              <option value="ARCHIVED">{dict.admin.archived}</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 pt-7 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 rounded" />
            {dict.home.featuredTitle}
          </label>
        </div>
      </section>

      {/* Media */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-semibold">{dict.admin.media}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{dict.admin.media} (thumbnail URL)</Label>
            <Input value={form.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} placeholder="https://… / /uploads/…" />
            <div className="mt-2">
              <FileUpload dict={dict} accept="image/*" onUploaded={(f) => set("thumbnailUrl", f.url)} />
            </div>
          </div>
          <div>
            <Label>{dict.course.preview} (promo video URL)</Label>
            <Input value={form.promoVideoUrl} onChange={(e) => set("promoVideoUrl", e.target.value)} placeholder="https://youtube.com/…" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-semibold">{dict.admin.pricing}</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFree} onChange={(e) => set("isFree", e.target.checked)} className="h-4 w-4 rounded" />
          {dict.common.free}
        </label>
        {!form.isFree && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{dict.courses.price} (minor units, e.g. cents)</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={form.currency} maxLength={3} onChange={(e) => set("currency", e.target.value.toUpperCase())} />
            </div>
          </div>
        )}
      </section>

      {/* Objectives & requirements */}
      {(["objectives", "requirements"] as const).map((key) => (
        <section key={key} className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{key === "objectives" ? dict.course.objectives : dict.course.requirements}</h2>
            <Button size="sm" variant="outline" onClick={() => addItem(key)}>
              <Plus className="h-4 w-4" /> {dict.common.add}
            </Button>
          </div>
          <div className="space-y-2">
            {form[key].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input placeholder="English" value={item.en} onChange={(e) => setList(key, i, "en", e.target.value)} />
                <Input placeholder="العربية" dir="rtl" value={item.ar} onChange={(e) => setList(key, i, "ar", e.target.value)} />
                <button onClick={() => removeItem(key, i)} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {form[key].length === 0 && <p className="text-sm text-ink-400">{dict.common.optional}</p>}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={saving} size="lg">
          {saving ? dict.common.saving : dict.common.save}
        </Button>
        {initial?.id && <Badge tone="gray">{dict.common.edit}</Badge>}
      </div>
    </div>
  );
}
