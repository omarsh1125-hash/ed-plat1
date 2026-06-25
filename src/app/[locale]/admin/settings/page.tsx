import { Globe2, Database, HardDrive, CreditCard, Languages } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const rows = [
    { icon: Globe2, label: dict.common.platformName, value: process.env.NEXT_PUBLIC_PLATFORM_NAME || "EduPlatform" },
    { icon: Database, label: "Database", value: "PostgreSQL (Prisma)" },
    { icon: HardDrive, label: "Storage", value: (process.env.STORAGE_DRIVER || "local").toUpperCase() },
    { icon: CreditCard, label: dict.admin.paymentManagement, value: (process.env.PAYMENTS_DRIVER || "stub").toUpperCase() },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{dict.admin.settings}</h1>

      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-semibold">{dict.admin.analytics}</h2>
        <dl className="divide-y divide-ink-100">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-sm text-ink-600">
                <r.icon className="h-4 w-4 text-brand-500" /> {r.label}
              </dt>
              <dd className="text-sm font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <Languages className="h-4 w-4 text-brand-500" /> {dict.admin.languageManagement}
        </h2>
        <p className="text-sm text-ink-500">{dict.home.benefit2Desc}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-ink-100 p-4">
            <p className="font-medium">English (LTR)</p>
            <p className="text-xs text-ink-400">src/i18n/dictionaries/en.json</p>
          </div>
          <div className="rounded-xl border border-ink-100 p-4">
            <p className="font-medium">العربية (RTL)</p>
            <p className="text-xs text-ink-400">src/i18n/dictionaries/ar.json</p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-ink-50 p-3 text-xs text-ink-500">
          {dict.admin.english} / {dict.admin.arabic}: every course and lesson stores paired EN/AR fields and is edited from the course editor’s language tabs.
        </p>
      </section>
    </div>
  );
}
