"use client";

import { useState } from "react";
import { Input, Textarea, Select, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/admin/FileUpload";
import { lessonTypeLabels } from "@/lib/lessonMeta";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";
import type { LessonType } from "@prisma/client";

export type LessonDraft = {
  id?: string;
  titleEn: string;
  titleAr: string;
  type: LessonType;
  contentUrl: string;
  bodyEn: string;
  bodyAr: string;
  durationMinutes: number;
  isPreview: boolean;
};

const UPLOAD_TYPES: LessonType[] = ["VIDEO_UPLOAD", "PDF", "SLIDES", "DOCUMENT", "IMAGE", "AUDIO"];
const URL_TYPES: LessonType[] = ["VIDEO_EMBED", "EXTERNAL_LINK"];

export function LessonForm({
  locale,
  dict,
  moduleId,
  initial,
  onSaved,
  onCancel,
}: {
  locale: Locale;
  dict: Dictionary;
  moduleId: string;
  initial?: LessonDraft;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [d, setD] = useState<LessonDraft>(
    initial ?? {
      titleEn: "", titleAr: "", type: "VIDEO_EMBED", contentUrl: "",
      bodyEn: "", bodyAr: "", durationMinutes: 0, isPreview: false,
    }
  );
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof LessonDraft>(k: K, v: LessonDraft[K]) => setD((s) => ({ ...s, [k]: v }));

  async function save() {
    setSaving(true);
    const res = await fetch(
      initial?.id ? `/api/admin/lessons/${initial.id}` : "/api/admin/lessons",
      {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, moduleId }),
      }
    );
    setSaving(false);
    if (res.ok) onSaved();
  }

  const isUpload = UPLOAD_TYPES.includes(d.type);
  const isUrl = URL_TYPES.includes(d.type);
  const isText = d.type === "TEXT";

  return (
    <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>{dict.admin.courseTitle} (EN)</Label><Input value={d.titleEn} onChange={(e) => set("titleEn", e.target.value)} /></div>
        <div><Label>{dict.admin.courseTitle} (ع)</Label><Input dir="rtl" value={d.titleAr} onChange={(e) => set("titleAr", e.target.value)} /></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>{dict.admin.lessonType}</Label>
          <Select value={d.type} onChange={(e) => set("type", e.target.value as LessonType)}>
            {Object.entries(lessonTypeLabels).map(([val, lab]) => (
              <option key={val} value={val}>{locale === "ar" ? lab.ar : lab.en}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{dict.course.duration} ({dict.common.minutes})</Label>
          <Input type="number" min={0} value={d.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} />
        </div>
      </div>

      {(isUrl || isUpload) && (
        <div>
          <Label>{dict.admin.contentUrl}</Label>
          <Input value={d.contentUrl} onChange={(e) => set("contentUrl", e.target.value)} placeholder={isUrl ? "https://…" : "/uploads/…"} />
          {isUpload && (
            <div className="mt-2">
              <FileUpload dict={dict} onUploaded={(f) => set("contentUrl", f.url)} />
            </div>
          )}
        </div>
      )}

      {isText && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>{dict.admin.lessonBody} (EN)</Label><Textarea value={d.bodyEn} onChange={(e) => set("bodyEn", e.target.value)} /></div>
          <div><Label>{dict.admin.lessonBody} (ع)</Label><Textarea dir="rtl" value={d.bodyAr} onChange={(e) => set("bodyAr", e.target.value)} /></div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={d.isPreview} onChange={(e) => set("isPreview", e.target.checked)} className="h-4 w-4 rounded" />
        {dict.course.preview}
      </label>

      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving || (!d.titleEn && !d.titleAr)}>
          {saving ? dict.common.saving : dict.common.save}
        </Button>
        {onCancel && <Button size="sm" variant="ghost" onClick={onCancel}>{dict.common.cancel}</Button>}
      </div>
    </div>
  );
}
