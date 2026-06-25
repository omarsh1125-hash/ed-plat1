"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

export function EnrollButton({
  slug,
  locale,
  dict,
  isFree,
  priceLabel,
  enrolled,
}: {
  slug: string;
  locale: Locale;
  dict: Dictionary;
  isFree: boolean;
  priceLabel: string;
  enrolled: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (enrolled) {
    return (
      <ButtonLink href={`/${locale}/learn/${slug}`} size="lg" className="w-full">
        {dict.course.continueLearning}
      </ButtonLink>
    );
  }

  if (status === "unauthenticated") {
    return (
      <ButtonLink
        href={`/${locale}/login?callbackUrl=/${locale}/courses/${slug}`}
        size="lg"
        className="w-full"
      >
        {dict.course.loginToEnroll}
      </ButtonLink>
    );
  }

  async function enroll() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/courses/${slug}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(dict.common.errorGeneric);
    if (data?.data?.requiresPayment && data?.data?.redirectUrl) {
      router.push(data.data.redirectUrl);
      return;
    }
    router.push(`/${locale}/learn/${slug}`);
    router.refresh();
  }

  return (
    <div className="w-full">
      <Button size="lg" className="w-full" onClick={enroll} disabled={loading}>
        {loading
          ? dict.common.loading
          : isFree
          ? dict.course.enrollFree
          : `${dict.course.buyNow} · ${priceLabel}`}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
