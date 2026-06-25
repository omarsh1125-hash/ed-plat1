import { notFound } from "next/navigation";
import { locales, isLocale, getDirection, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { Providers } from "@/components/Providers";

// Latin + Arabic system font stacks exposed as CSS variables Tailwind reads.
// (Swap for next/font later if you want self-hosted webfonts.)
const fontVars = {
  "--font-latin":
    "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  "--font-arabic":
    "'Noto Sans Arabic', 'Cairo', 'Tajawal', 'Segoe UI', ui-sans-serif, system-ui, sans-serif",
} as React.CSSProperties;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dir = getDirection(locale);
  // Touch the dictionary so a missing locale fails fast during build.
  getDictionary(locale);

  return (
    <html lang={locale} dir={dir} style={fontVars} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
