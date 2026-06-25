import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const dict = getDictionary(params.locale);
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href={`/${params.locale}`} className="flex items-center gap-2 font-bold text-brand-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            {dict.common.platformName}
          </Link>
          <LanguageSwitcher locale={params.locale} />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      {/* Brand side */}
      <div className="relative hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 lg:block">
        <div className="flex h-full flex-col justify-center px-12 text-white">
          <GraduationCap className="h-12 w-12 opacity-90" />
          <h2 className="mt-6 text-3xl font-bold leading-snug text-white">
            {dict.home.heroTitle}
          </h2>
          <p className="mt-4 max-w-md text-brand-100">{dict.home.heroSubtitle}</p>
        </div>
      </div>
    </div>
  );
}
