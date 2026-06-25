import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const dict = getDictionary(params.locale);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar locale={params.locale} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer locale={params.locale} dict={dict} />
    </div>
  );
}
