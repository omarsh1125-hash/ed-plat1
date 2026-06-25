"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GraduationCap, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import { cn, initials } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: string };

export function DashboardShell({
  locale,
  title,
  nav,
  user,
  logoutLabel,
  children,
}: {
  locale: Locale;
  title: string;
  nav: NavItem[];
  user: { name: string; email: string; role: string };
  logoutLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link href={`/${locale}`} className="flex items-center gap-2 px-5 py-5 font-bold text-brand-700">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span>{title}</span>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const Icon = ((Icons as Record<string, unknown>)[item.icon] as LucideIcon) || Icons.Circle;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-100"
              )}
            >
              <Icon className="h-4.5 w-4.5 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" /> {logoutLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 hidden w-64 border-ink-100 bg-white lg:block ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-ink-100">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-brand-700">{title}</span>
        <LanguageSwitcher locale={locale} compact />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 w-64 bg-white ltr:left-0 rtl:right-0">
            <button onClick={() => setOpen(false)} className="absolute top-4 rounded-lg p-2 hover:bg-ink-100 ltr:right-3 rtl:left-3">
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="ltr:lg:pl-64 rtl:lg:pr-64">
        <div className="hidden items-center justify-end gap-3 border-b border-ink-100 bg-white px-6 py-3 lg:flex">
          <LanguageSwitcher locale={locale} />
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
