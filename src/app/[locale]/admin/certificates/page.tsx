import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui";
import { formatDate, localized } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCertificatesPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const certs = await prisma.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { titleEn: true, titleAr: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{dict.admin.certificateManagement}</h1>

      {certs.length === 0 ? (
        <EmptyState icon={<Award className="h-10 w-10" />} title={dict.dashboard.earnedCertificates} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="p-3 text-start font-medium">{dict.certificate.certificateId}</th>
                <th className="p-3 text-start font-medium">{dict.auth.name}</th>
                <th className="p-3 text-start font-medium">{dict.nav.courses}</th>
                <th className="p-3 text-start font-medium">{dict.certificate.issuedOn}</th>
                <th className="p-3 text-end font-medium">{dict.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50">
                  <td className="p-3 font-mono text-xs">{c.serial}</td>
                  <td className="p-3">
                    <p className="font-medium">{c.user.name}</p>
                    <p className="text-xs text-ink-400">{c.user.email}</p>
                  </td>
                  <td className="p-3">{localized(c.course, "title", locale)}</td>
                  <td className="p-3 text-ink-500">{formatDate(c.issuedAt, locale)}</td>
                  <td className="p-3 text-end">
                    <Link href={`/${locale}/certificate/${c.serial}`} className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                      <ExternalLink className="h-4 w-4" /> {dict.common.view}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
