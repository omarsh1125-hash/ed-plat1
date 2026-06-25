"use client";

import { useState } from "react";
import { Upload, Check, Loader2 } from "lucide-react";
import type { Dictionary } from "@/i18n/getDictionary";

export function FileUpload({
  dict,
  onUploaded,
  accept,
  label,
}: {
  dict: Dictionary;
  onUploaded: (file: { url: string; fileName: string; mimeType: string }) => void;
  accept?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setDone(false);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setBusy(false);
    if (!res.ok) {
      setError(dict.common.errorGeneric);
      return;
    }
    const data = await res.json();
    setDone(true);
    onUploaded(data.data);
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-sm font-medium text-ink-600 hover:border-brand-400 hover:bg-brand-50">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : done ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {label || dict.admin.uploadFile}
        <input type="file" className="hidden" accept={accept} onChange={handle} disabled={busy} />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
