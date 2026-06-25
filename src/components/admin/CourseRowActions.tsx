"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Trash2, Pencil } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

export function CourseRowActions({
  locale,
  dict,
  courseId,
  status,
}: {
  locale: Locale;
  dict: Dictionary;
  courseId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await fetch(`/api/admin/courses/${courseId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(dict.admin.confirmDelete)) return;
    setBusy(true);
    await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/${locale}/admin/courses/${courseId}`}
        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-brand-700"
        title={dict.common.edit}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={toggle}
        disabled={busy}
        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-brand-700"
        title={status === "PUBLISHED" ? dict.admin.unpublish : dict.admin.publish}
      >
        {status === "PUBLISHED" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
        title={dict.common.delete}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
