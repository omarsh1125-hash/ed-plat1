import { redirect } from "next/navigation";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { getCurrentSession } from "@/lib/session";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  const session = await getCurrentSession();
  if (!session?.user) redirect(`/${locale}/login?callbackUrl=/${locale}/admin`);
  if (session.user.role !== "ADMIN") redirect(`/${locale}/dashboard`);

  const dict = getDictionary(locale);
  const p = (path: string) => `/${locale}/admin${path}`;

  const nav: NavItem[] = [
    { href: p(""), label: dict.admin.overview, icon: "LayoutDashboard" },
    { href: p("/courses"), label: dict.admin.courseManagement, icon: "BookOpen" },
    { href: p("/users"), label: dict.admin.userManagement, icon: "Users" },
    { href: p("/certificates"), label: dict.admin.certificateManagement, icon: "Award" },
    { href: p("/payments"), label: dict.admin.paymentManagement, icon: "CreditCard" },
    { href: p("/settings"), label: dict.admin.settings, icon: "Settings" },
  ];

  return (
    <DashboardShell
      locale={locale}
      title={`${dict.common.platformName} · ${dict.admin.title}`}
      nav={nav}
      user={{ name: session.user.name || "", email: session.user.email || "", role: session.user.role }}
      logoutLabel={dict.nav.logout}
    >
      {children}
    </DashboardShell>
  );
}
