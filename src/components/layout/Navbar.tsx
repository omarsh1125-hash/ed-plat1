"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, GraduationCap, LayoutDashboard, Shield, LogOut, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ButtonLink, Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Navbar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const p = (path: string) => `/${locale}${path}`;

  const links = [
    { href: p(""), label: dict.nav.home },
    { href: p("/courses"), label: dict.nav.courses },
    { href: p("/about"), label: dict.nav.about },
    { href: p("/contact"), label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur">
      <nav className="container-px flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href={p("")} className="flex items-center gap-2 font-bold text-brand-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg">{dict.common.platformName}</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />

          {session?.user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-200 py-1 ps-1 pe-3 hover:bg-ink-50"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {initials(session.user.name || "U")}
                </span>
                <span className="max-w-[120px] truncate text-sm font-medium">
                  {session.user.name}
                </span>
              </button>
              {menu && (
                <div
                  className="absolute end-0 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-soft"
                  onMouseLeave={() => setMenu(false)}
                >
                  <Link href={p("/dashboard")} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-ink-50">
                    <LayoutDashboard className="h-4 w-4" /> {dict.nav.dashboard}
                  </Link>
                  <Link href={p("/dashboard/profile")} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-ink-50">
                    <User className="h-4 w-4" /> {dict.nav.profile}
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link href={p("/admin")} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-ink-50">
                      <Shield className="h-4 w-4" /> {dict.nav.admin}
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: p("") })}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> {dict.nav.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <ButtonLink href={p("/login")} variant="ghost" size="sm">
                {dict.nav.login}
              </ButtonLink>
              <ButtonLink href={p("/register")} size="sm">
                {dict.nav.register}
              </ButtonLink>
            </div>
          )}

          <button
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <div className="container-px flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-ink-100" />
            {session?.user ? (
              <>
                <Link href={p("/dashboard")} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-ink-100">
                  {dict.nav.dashboard}
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href={p("/admin")} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-ink-100">
                    {dict.nav.admin}
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: p("") })} className="mt-1">
                  {dict.nav.logout}
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <ButtonLink href={p("/login")} variant="outline" size="sm" className="flex-1">
                  {dict.nav.login}
                </ButtonLink>
                <ButtonLink href={p("/register")} size="sm" className="flex-1">
                  {dict.nav.register}
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
