import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/config";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pick the localized field from an entity that has `<field>En` / `<field>Ar`. */
export function localized<T extends Record<string, any>>(
  entity: T,
  field: string,
  locale: Locale
): string {
  const suffix = locale === "ar" ? "Ar" : "En";
  const value = entity[`${field}${suffix}`];
  // Fall back to the other language if one side is empty.
  if (value) return value as string;
  const fallback = entity[`${field}${locale === "ar" ? "En" : "Ar"}`];
  return (fallback as string) ?? "";
}

/** Pick `en`/`ar` from a `{ en, ar }` object. */
export function pickLocale(
  obj: { en?: string; ar?: string } | null | undefined,
  locale: Locale
): string {
  if (!obj) return "";
  return (locale === "ar" ? obj.ar : obj.en) || obj.en || obj.ar || "";
}

/** Format minor-unit price (cents) with currency, localized digits. */
export function formatPrice(
  amountMinor: number,
  currency: string,
  locale: Locale
): string {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDuration(minutes: number, locale: Locale): string {
  if (!minutes) return locale === "ar" ? "٠ دقيقة" : "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hLabel = locale === "ar" ? "س" : "h";
  const mLabel = locale === "ar" ? "د" : "m";
  if (h && m) return `${h}${hLabel} ${m}${mLabel}`;
  if (h) return `${h}${hLabel}`;
  return `${m}${mLabel}`;
}

/** URL-safe slug from arbitrary text (keeps Arabic letters). */
export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Generate a random certificate serial like CERT-XXXX-XXXX-XXXX. */
export function generateSerial(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `CERT-${block()}-${block()}-${block()}`;
}
