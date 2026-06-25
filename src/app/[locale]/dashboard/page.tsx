import Link from "next/link";
import { BookOpen, CheckCircle2, Award, TrendingUp, PlayCircle } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { getCurrentSession } from "@/lib/session";
import { getStudentEnrollments, getStudentStats } from "@/lib/student";
import { StatCard } from "@/components/StatCard";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressBar, EmptyState } from "@/components/ui";
import { localized } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardOverview({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const session = await getCurrentSession();
  const userId = session!.user.id;

  const [stats, enrollments] = await Promise.all([
    getStudentStats(userId),
    getStudentEnrollments(userId),
  ]);

  // The "My courses" grid shows the most recent enrollments regardless of
  // status (completed courses included); the continue-learning banner targets
  // an in-progress course specifically.
  const recent = enrollments.slice(0, 3);
  const continueCourse = enrollments.find((e) => e.progress > 0 && e.status !== "COMPLETED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {dict.dashboard.welcome}, {session!.user.name?.split(" ")[0]} 👋
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label={dict.dashboard.enrolledCourses} value={stats.enrolled} />
        <StatCard icon={TrendingUp} label={dict.dashboard.avgProgress} value={`${stats.avgProgress}%`} tone="amber" />
        <StatCard icon={CheckCircle2} label={dict.dashboard.completed} value={stats.completed} tone="green" />
        <StatCard icon={Award} label={dict.dashboard.earnedCertificates} value={stats.certificates} tone="purple" />
      </div>

      {continueCourse && (
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6">
          <p className="text-sm font-medium text-brand-600">{dict.dashboard.continueLearning}</p>
          <h2 className="mt-1 text-lg font-bold">{localized(continueCourse.course, "title", locale)}</h2>
          <div className="mt-3 max-w-md">
            <ProgressBar value={continueCourse.progress} />
            <p className="mt-1 text-xs text-ink-500">{continueCourse.progress}%</p>
          </div>
          <ButtonLink href={`/${locale}/learn/${continueCourse.course.slug}`} className="mt-4">
            <PlayCircle className="h-4 w-4" /> {dict.dashboard.continueLearning}
          </ButtonLink>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{dict.dashboard.myCourses}</h2>
          <Link href={`/${locale}/dashboard/courses`} className="text-sm font-medium text-brand-600 hover:underline">
            {dict.common.viewAll}
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-10 w-10" />}
            title={dict.dashboard.noCourses}
            action={<ButtonLink href={`/${locale}/courses`}>{dict.dashboard.browseCourses}</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((e) => (
              <Link
                key={e.id}
                href={`/${locale}/learn/${e.course.slug}`}
                className="rounded-2xl border border-ink-100 bg-white p-5 transition hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-semibold">{localized(e.course, "title", locale)}</h3>
                  {e.status === "COMPLETED" && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> {dict.dashboard.completed}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-ink-500">
                    <span>{dict.learn.progress}</span>
                    <span>{e.progress}%</span>
                  </div>
                  <ProgressBar value={e.progress} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
