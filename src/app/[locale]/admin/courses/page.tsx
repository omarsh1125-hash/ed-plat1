import Link from "next/link";
import { Plus } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, EmptyState } from "@/components/ui";
import { CourseRowActions } from "@/components/admin/CourseRowActions";
import { localized, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusTone = { DRAFT: "gray", PUBLISHED: "green", ARCHIVED: "amber" } as const;

export default async function AdminCoursesPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const courses = await prisma.course.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { nameEn: true, nameAr: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{dict.admin.courseManagement}</h1>
        <ButtonLink href={`/${locale}/admin/courses/new`}>
          <Plus className="h-4 w-4" /> {dict.admin.newCourse}
        </ButtonLink>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title={dict.admin.noCoursesYet}
          action={<ButtonLink href={`/${locale}/admin/courses/new`}>{dict.admin.newCourse}</ButtonLink>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="p-3 text-start font-medium">{dict.admin.courseTitle}</th>
                <th className="p-3 text-start font-medium">{dict.courses.category}</th>
                <th className="p-3 text-start font-medium">{dict.common.status}</th>
                <th className="p-3 text-start font-medium">{dict.courses.students}</th>
                <th className="p-3 text-start font-medium">{dict.courses.price}</th>
                <th className="p-3 text-end font-medium">{dict.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50">
                  <td className="p-3">
                    <Link href={`/${locale}/admin/courses/${c.id}`} className="font-medium text-brand-700 hover:underline">
                      {localized(c, "title", locale)}
                    </Link>
                    <p className="text-xs text-ink-400">{c._count.modules} {dict.courses.modules}</p>
                  </td>
                  <td className="p-3 text-ink-600">{c.category ? localized(c.category, "name", locale) : "—"}</td>
                  <td className="p-3">
                    <Badge tone={statusTone[c.status]}>
                      {dict.admin[c.status.toLowerCase() as "draft" | "published" | "archived"]}
                    </Badge>
                  </td>
                  <td className="p-3">{c._count.enrollments}</td>
                  <td className="p-3">{c.isFree ? dict.common.free : formatPrice(c.price, c.currency, locale)}</td>
                  <td className="p-3">
                    <CourseRowActions locale={locale} dict={dict} courseId={c.id} status={c.status} />
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
