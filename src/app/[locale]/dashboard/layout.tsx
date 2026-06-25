import { redirect } from "next/navigation";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { getCurrentSession } from "@/lib/session";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  const session = await getCurrentSession();
  if (!session?.user) redirect(`/${locale}/login?callbackUrl=/${locale}/dashboard`);

  const dict = getDictionary(locale);
  const p = (path: string) => `/${locale}/dashboard${path}`;

  const nav: NavItem[] = [
    { href: p(""), label: dict.dashboard.overview, icon: "LayoutDashboard" },
    { href: p("/courses"), label: dict.dashboard.myCourses, icon: "BookOpen" },
    { href: p("/certificates"), label: dict.dashboard.certificates, icon: "Award" },
    { href: p("/profile"), label: dict.dashboard.profile, icon: "User" },
    { href: p("/settings"), label: dict.dashboard.settings, icon: "Settings" },
  ];

  return (
    <DashboardShell
      locale={locale}
      title={dict.common.platformName}
      nav={nav}
      user={{ name: session.user.name || "", email: session.user.email || "", role: session.user.role }}
      logoutLabel={dict.nav.logout}
    >
      {children}
    </DashboardShell>
  );
}
