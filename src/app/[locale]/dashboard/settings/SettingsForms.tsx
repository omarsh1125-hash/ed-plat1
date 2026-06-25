"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

export function SettingsForms({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    setErr("");
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword"));
    if (newPassword.length < 8) return setErr(dict.auth.passwordTooShort);
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg(dict.profile.passwordUpdated);
      (e.target as HTMLFormElement).reset();
    } else {
      setErr(dict.auth.invalidCredentials);
    }
  }

  async function setLocalePref(pref: "EN" | "AR") {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: undefined, locale: pref }),
    }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      {/* Language preference */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-semibold">{dict.profile.languagePreference}</h2>
        <p className="mt-1 text-sm text-ink-500">{dict.home.benefit2Desc}</p>
        <div className="mt-4 flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <span className="text-sm text-ink-500">
            {locale === "ar" ? dict.common.arabic : dict.common.english}
          </span>
        </div>
      </div>

      {/* Change password */}
      <form onSubmit={changePassword} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-semibold">{dict.profile.changePassword}</h2>
        {msg && <div className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{msg}</div>}
        {err && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{err}</div>}
        <div>
          <Label htmlFor="currentPassword">{dict.profile.currentPassword}</Label>
          <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
        </div>
        <div>
          <Label htmlFor="newPassword">{dict.profile.newPassword}</Label>
          <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? dict.common.saving : dict.common.save}
        </Button>
      </form>
    </div>
  );
}
