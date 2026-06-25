import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { SettingsForms } from "./SettingsForms";

export const dynamic = "force-dynamic";

export default function SettingsPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{dict.dashboard.settings}</h1>
      <SettingsForms locale={locale} dict={dict} />
    </div>
  );
}
