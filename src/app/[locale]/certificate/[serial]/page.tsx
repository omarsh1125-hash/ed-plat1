import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { GraduationCap, ShieldCheck, BadgeCheck } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/PrintButton";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params,
}: {
  params: { locale: Locale; serial: string };
}) {
  const { locale, serial } = params;
  const dict = getDictionary(locale);

  const cert = await prisma.certificate.findUnique({
    where: { serial },
  });
  if (!cert) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/${locale}/certificate/${serial}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 });

  const courseTitle = locale === "ar" ? cert.courseTitleAr : cert.courseTitleEn;
  const platform = process.env.NEXT_PUBLIC_PLATFORM_NAME || dict.common.platformName;

  return (
    <div className="min-h-screen bg-ink-100 py-10">
      <div className="container-px max-w-3xl">
        {/* Verify banner */}
        <div className="no-print mb-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="flex items-center gap-2 font-medium text-emerald-800">
            <ShieldCheck className="h-5 w-5" /> {dict.certificate.valid}
          </span>
          <PrintButton label={dict.certificate.download} />
        </div>

        {/* Certificate */}
        <div className="relative overflow-hidden rounded-2xl border-[6px] border-double border-brand-700 bg-white p-8 shadow-soft sm:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
            <GraduationCap className="absolute -right-10 -top-10 h-64 w-64" />
          </div>

          <div className="relative text-center">
            <div className="flex items-center justify-center gap-2 text-brand-700">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-bold">{platform}</span>
            </div>

            <p className="mt-8 text-sm uppercase tracking-[0.2em] text-ink-400">
              {dict.certificate.title}
            </p>

            <p className="mt-6 text-ink-500">{dict.certificate.presentedTo}</p>
            <h1 className="mt-2 text-3xl font-bold text-brand-900 sm:text-4xl">{cert.studentName}</h1>

            <p className="mt-6 text-ink-500">{dict.certificate.hasCompleted}</p>
            <h2 className="mt-2 text-xl font-semibold text-ink-900">{courseTitle}</h2>

            <div className="mx-auto mt-8 flex max-w-md items-end justify-between gap-6">
              <div className="text-start">
                <p className="text-xs text-ink-400">{dict.certificate.issuedOn}</p>
                <p className="font-medium">{formatDate(cert.issuedAt, locale)}</p>
                <p className="mt-3 text-xs text-ink-400">{dict.certificate.certificateId}</p>
                <p className="font-mono text-sm">{cert.serial}</p>
              </div>
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR" className="h-24 w-24 rounded-lg border border-ink-100" />
                <p className="mt-1 text-[10px] text-ink-400">{dict.certificate.scanToVerify}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-1.5 text-sm text-emerald-600">
              <BadgeCheck className="h-4 w-4" /> {dict.certificate.valid}
            </div>
          </div>
        </div>

        <p className="no-print mt-6 text-center text-sm text-ink-500">
          <Link href={`/${locale}/dashboard/certificates`} className="font-medium text-brand-600 hover:underline">
            {dict.dashboard.certificates}
          </Link>
        </p>
      </div>
    </div>
  );
}
