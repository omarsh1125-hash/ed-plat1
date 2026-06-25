import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default function FaqPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  return (
    <div className="container-px max-w-3xl py-14">
      <h1 className="text-3xl font-bold">{dict.pages.faqTitle}</h1>
      <div className="mt-8 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
        {dict.faqItems.map((f, i) => (
          <details key={i} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-medium">
              {f.q}
              <span className="text-ink-400 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-ink-500">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
