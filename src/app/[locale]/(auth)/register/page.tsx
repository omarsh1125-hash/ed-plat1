"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default function RegisterPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "en";
  const dict = getDictionary(locale);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));

    if (password.length < 8) return setError(dict.auth.passwordTooShort);
    if (password !== confirm) return setError(dict.auth.passwordsMismatch);

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      setError(data.error === "EMAIL_IN_USE" ? dict.auth.emailInUse : dict.common.errorGeneric);
      return;
    }

    // Auto sign-in after successful registration.
    await signIn("credentials", { email, password, redirect: false });
    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{dict.auth.registerTitle}</h1>
      <p className="mt-1.5 text-sm text-ink-500">{dict.auth.registerSubtitle}</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
        )}
        <div>
          <Label htmlFor="name">{dict.auth.name}</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">{dict.auth.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">{dict.auth.password}</Label>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirm">{dict.auth.confirmPassword}</Label>
          <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? dict.common.loading : dict.auth.register}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {dict.auth.haveAccount}{" "}
        <Link href={`/${locale}/login`} className="font-medium text-brand-600 hover:underline">
          {dict.auth.signIn}
        </Link>
      </p>
    </div>
  );
}
