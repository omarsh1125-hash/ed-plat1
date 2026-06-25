"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

export function ProfileForm({
  locale,
  dict,
  initial,
}: {
  locale: Locale;
  dict: Dictionary;
  initial: { name: string; email: string; bio: string; avatarUrl: string };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        bio: form.get("bio"),
        avatarUrl: form.get("avatarUrl") || "",
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg(dict.profile.updated);
      router.refresh();
    } else {
      setMsg(dict.common.errorGeneric);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
      {msg && <div className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{msg}</div>}
      <div>
        <Label htmlFor="name">{dict.profile.name}</Label>
        <Input id="name" name="name" defaultValue={initial.name} required />
      </div>
      <div>
        <Label htmlFor="email">{dict.profile.email}</Label>
        <Input id="email" defaultValue={initial.email} disabled />
      </div>
      <div>
        <Label htmlFor="bio">{dict.profile.bio}</Label>
        <Textarea id="bio" name="bio" defaultValue={initial.bio} />
      </div>
      <div>
        <Label htmlFor="avatarUrl">{dict.profile.avatar}</Label>
        <Input id="avatarUrl" name="avatarUrl" type="url" defaultValue={initial.avatarUrl} placeholder="https://…" />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? dict.common.saving : dict.common.save}
      </Button>
    </form>
  );
}
