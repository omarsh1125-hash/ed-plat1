import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { Globe2, Target, ShieldCheck, Users } from "lucide-react";

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const values = [
    { icon: Globe2, title: dict.home.benefit2Title, desc: dict.home.benefit2Desc },
    { icon: Target, title: dict.home.benefit1Title, desc: dict.home.benefit1Desc },
    { icon: ShieldCheck, title: dict.home.benefit4Title, desc: dict.home.benefit4Desc },
    { icon: Users, title: dict.home.benefit3Title, desc: dict.home.benefit3Desc },
  ];
  return (
    <div className="container-px max-w-4xl py-14">
      <h1 className="text-3xl font-bold">{dict.pages.aboutTitle}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-600">{dict.pages.aboutBody}</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl border border-ink-100 bg-white p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <v.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{v.title}</h3>
            <p className="mt-1.5 text-sm text-ink-500">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
