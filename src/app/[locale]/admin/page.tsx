import Link from "next/link";
import { Users, BookOpen, GraduationCap, TrendingUp, Award, CreditCard, FileText } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui";
import { ButtonLink } from "@/components/ui/Button";
import { localized, formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const [
    totalUsers,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    activeStudents,
    certificates,
    enrollments,
    revenueAgg,
    recentCourses,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count(),
    prisma.enrollment.findMany({ distinct: ["userId"], select: { userId: true } }),
    prisma.certificate.count(),
    prisma.enrollment.findMany({ select: { progress: true } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, slug: true, titleEn: true, titleAr: true, status: true, isFree: true, price: true, currency: true, _count: { select: { enrollments: true } } },
    }),
  ]);

  const avgCompletion = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
    : 0;
  const revenue = revenueAgg._sum.amount || 0;

  const statusTone = { DRAFT: "gray", PUBLISHED: "green", ARCHIVED: "amber" } as const;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{dict.admin.overview}</h1>
        <ButtonLink href={`/${locale}/admin/courses/new`}>{dict.admin.newCourse}</ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label={dict.admin.totalUsers} value={totalUsers} />
        <StatCard icon={BookOpen} label={dict.admin.totalCourses} value={totalCourses} tone="amber" />
        <StatCard icon={GraduationCap} label={dict.admin.activeStudents} value={activeStudents.length} tone="green" />
        <StatCard icon={TrendingUp} label={dict.admin.completionRate} value={`${avgCompletion}%`} tone="purple" />
        <StatCard icon={FileText} label={dict.admin.totalEnrollments} value={totalEnrollments} />
        <StatCard icon={BookOpen} label={dict.admin.publishedCourses} value={publishedCourses} tone="green" />
        <StatCard icon={Award} label={dict.admin.certificateManagement} value={certificates} tone="amber" />
        <StatCard icon={CreditCard} label={dict.admin.paymentManagement} value={formatPrice(revenue, "USD", locale)} tone="purple" />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{dict.admin.courseManagement}</h2>
          <Link href={`/${locale}/admin/courses`} className="text-sm font-medium text-brand-600 hover:underline">
            {dict.common.viewAll}
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-start text-xs uppercase text-ink-400">
              <tr>
                <th className="p-3 text-start font-medium">{dict.admin.courseTitle}</th>
                <th className="p-3 text-start font-medium">{dict.common.status}</th>
                <th className="p-3 text-start font-medium">{dict.courses.students}</th>
                <th className="p-3 text-start font-medium">{dict.courses.price}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {recentCourses.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50">
                  <td className="p-3">
                    <Link href={`/${locale}/admin/courses/${c.id}`} className="font-medium text-brand-700 hover:underline">
                      {localized(c, "title", locale)}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Badge tone={statusTone[c.status]}>
                      {dict.admin[c.status.toLowerCase() as "draft" | "published" | "archived"]}
                    </Badge>
                  </td>
                  <td className="p-3">{c._count.enrollments}</td>
                  <td className="p-3">{c.isFree ? dict.common.free : formatPrice(c.price, c.currency, locale)}</td>
                </tr>
              ))}
              {recentCourses.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-ink-400">{dict.admin.noCoursesYet}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
