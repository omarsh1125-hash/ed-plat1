import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate, localized } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CertificatesPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const session = await getCurrentSession();

  const certificates = await prisma.certificate.findMany({
    where: { userId: session!.user.id },
    orderBy: { issuedAt: "desc" },
    include: { course: { select: { titleEn: true, titleAr: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{dict.dashboard.certificates}</h1>

      {certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="h-10 w-10" />}
          title={dict.dashboard.earnedCertificates}
          description={dict.home.benefit4Desc}
          action={<ButtonLink href={`/${locale}/courses`}>{dict.dashboard.browseCourses}</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink-100 bg-white p-6">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  <Award className="h-6 w-6" />
                </span>
                <code className="text-xs text-ink-400">{c.serial}</code>
              </div>
              <h3 className="mt-4 font-semibold">{localized(c.course, "title", locale)}</h3>
              <p className="mt-1 text-sm text-ink-500">
                {dict.certificate.issuedOn} {formatDate(c.issuedAt, locale)}
              </p>
              <ButtonLink href={`/${locale}/certificate/${c.serial}`} variant="outline" className="mt-4 w-full">
                <ExternalLink className="h-4 w-4" /> {dict.common.view}
              </ButtonLink>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
