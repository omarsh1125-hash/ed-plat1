"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "en";
  const dict = getDictionary(locale);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(form.get("email")) }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    setSent(true);
    if (data?.data?.devToken) {
      setDevLink(`/${locale}/reset-password?token=${data.data.devToken}`);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{dict.auth.resetTitle}</h1>
      <p className="mt-1.5 text-sm text-ink-500">{dict.auth.resetSubtitle}</p>

      {sent ? (
        <div className="mt-7 space-y-4">
          <div className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            {dict.auth.resetSent}
          </div>
          {devLink && (
            <Link href={devLink} className="block break-all text-sm font-medium text-brand-600 hover:underline">
              {devLink}
            </Link>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div>
            <Label htmlFor="email">{dict.auth.email}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? dict.common.loading : dict.auth.sendReset}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href={`/${locale}/login`} className="font-medium text-brand-600 hover:underline">
          {dict.auth.backToLogin}
        </Link>
      </p>
    </div>
  );
}
