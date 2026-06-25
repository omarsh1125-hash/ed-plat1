export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) || "en";

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const localeLabels: Record<Locale, { native: string; en: string }> = {
  en: { native: "English", en: "English" },
  ar: { native: "العربية", en: "Arabic" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return localeDirection[locale];
}

/** Map UI locale string to the Prisma `Locale` enum. */
export function toPrismaLocale(locale: Locale): "EN" | "AR" {
  return locale === "ar" ? "AR" : "EN";
}

export function fromPrismaLocale(locale: "EN" | "AR"): Locale {
  return locale === "AR" ? "ar" : "en";
}
