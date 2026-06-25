import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const p = (path: string) => `/${locale}${path}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-ink-100 bg-white">
      <div className="container-px grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href={p("")} className="flex items-center gap-2 font-bold text-brand-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg">{dict.common.platformName}</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-500">{dict.footer.tagline}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-900">{dict.footer.explore}</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
            <li><Link href={p("/courses")} className="hover:text-brand-700">{dict.nav.courses}</Link></li>
            <li><Link href={p("/faq")} className="hover:text-brand-700">{dict.nav.faq}</Link></li>
            <li><Link href={p("/about")} className="hover:text-brand-700">{dict.nav.about}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-900">{dict.footer.company}</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
            <li><Link href={p("/about")} className="hover:text-brand-700">{dict.nav.about}</Link></li>
            <li><Link href={p("/contact")} className="hover:text-brand-700">{dict.nav.contact}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-900">{dict.footer.legal}</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
            <li><Link href={p("/terms")} className="hover:text-brand-700">{dict.footer.terms}</Link></li>
            <li><Link href={p("/privacy")} className="hover:text-brand-700">{dict.footer.privacy}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-5 text-sm text-ink-400 sm:flex-row">
          <p>© {year} {dict.common.platformName}. {dict.footer.rights}</p>
          <p>{dict.common.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
