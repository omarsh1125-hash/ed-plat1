"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

export default function ContactPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "en";
  const dict = getDictionary(locale);
  const [sent, setSent] = useState(false);

  return (
    <div className="container-px grid max-w-5xl gap-10 py-14 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">{dict.pages.contactTitle}</h1>
        <p className="mt-3 text-ink-600">{dict.pages.contactBody}</p>
        <ul className="mt-8 space-y-4 text-sm text-ink-600">
          <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-brand-600" /> support@edu.test</li>
          <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-brand-600" /> +000 000 0000</li>
          <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand-600" /> Remote / Online</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        {sent ? (
          <div className="rounded-lg bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
            {dict.pages.contactSent}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="cname">{dict.pages.contactName}</Label>
              <Input id="cname" required />
            </div>
            <div>
              <Label htmlFor="cemail">{dict.pages.contactEmail}</Label>
              <Input id="cemail" type="email" required />
            </div>
            <div>
              <Label htmlFor="cmsg">{dict.pages.contactMessage}</Label>
              <Textarea id="cmsg" required />
            </div>
            <Button type="submit" className="w-full">{dict.pages.contactSend}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
