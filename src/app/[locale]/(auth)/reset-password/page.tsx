"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const params = useParams();
  const locale = (params.locale as Locale) || "en";
  const dict = getDictionary(locale);
  const search = useSearchParams();
  const router = useRouter();
  const token = search.get("token") || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password.length < 8) return setError(dict.auth.passwordTooShort);

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) return setError(dict.common.errorGeneric);
    setDone(true);
    setTimeout(() => router.push(`/${locale}/login`), 1500);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{dict.auth.resetPassword}</h1>

      {!token ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {dict.certificate.invalid}
        </p>
      ) : done ? (
        <div className="mt-7 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          {dict.auth.resetSuccess}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}
          <div>
            <Label htmlFor="password">{dict.auth.newPassword}</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? dict.common.loading : dict.auth.resetPassword}
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
