"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useParams();
  const locale = (params.locale as Locale) || "en";
  const dict = getDictionary(locale);
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(dict.auth.invalidCredentials);
      return;
    }
    const callback = search.get("callbackUrl");
    router.push(callback || `/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{dict.auth.loginTitle}</h1>
      <p className="mt-1.5 text-sm text-ink-500">{dict.auth.loginSubtitle}</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
        )}
        <div>
          <Label htmlFor="email">{dict.auth.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{dict.auth.password}</Label>
            <Link href={`/${locale}/forgot-password`} className="text-xs font-medium text-brand-600 hover:underline">
              {dict.auth.forgotPassword}
            </Link>
          </div>
          <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? dict.common.loading : dict.auth.login}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {dict.auth.noAccount}{" "}
        <Link href={`/${locale}/register`} className="font-medium text-brand-600 hover:underline">
          {dict.auth.signUp}
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-ink-200 bg-ink-50 p-3 text-xs text-ink-500">
        <p className="font-semibold text-ink-700">{dict.auth.demoAccounts}</p>
        <p className="mt-1">admin@edu.test · admin1234</p>
        <p>student@edu.test · student1234</p>
      </div>
    </div>
  );
}
