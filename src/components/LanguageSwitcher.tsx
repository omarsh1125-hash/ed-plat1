"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  compact,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    // Persist preference for middleware + future visits.
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    // Swap the leading locale segment of the current path.
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    router.push(segments.join("/") || `/${next}`);
    router.refresh();
  }

  if (compact) {
    const other: Locale = locale === "ar" ? "en" : "ar";
    return (
      <button
        onClick={() => switchTo(other)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
        {other === "ar" ? "العربية" : "EN"}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-ink-200 bg-white p-0.5 text-sm">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={cn(
            "rounded-md px-2.5 py-1 font-medium transition",
            l === locale ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-100"
          )}
        >
          {l === "ar" ? "ع" : "EN"}
        </button>
      ))}
    </div>
  );
}
