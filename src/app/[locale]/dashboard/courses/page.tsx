import Link from "next/link";
import { BookOpen, PlayCircle, CheckCircle2 } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { getCurrentSession } from "@/lib/session";
import { getStudentEnrollments } from "@/lib/student";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressBar, EmptyState, Badge } from "@/components/ui";
import { CourseThumbnail } from "@/components/CourseThumbnail";
import { localized } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyCoursesPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const session = await getCurrentSession();
  const enrollments = await getStudentEnrollments(session!.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{dict.dashboard.myCourses}</h1>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title={dict.dashboard.noCourses}
          action={<ButtonLink href={`/${locale}/courses`}>{dict.dashboard.browseCourses}</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => {
            const done = e.status === "COMPLETED";
            return (
              <div key={e.id} className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white">
                <div className="aspect-[16/9] bg-ink-100">
                  <CourseThumbnail src={e.course.thumbnailUrl} alt={localized(e.course, "title", locale)} iconClassName="h-8 w-8" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2">
                    {done ? (
                      <Badge tone="green"><CheckCircle2 className="h-3 w-3" /> {dict.dashboard.completed}</Badge>
                    ) : (
                      <Badge tone="amber">{dict.dashboard.inProgress}</Badge>
                    )}
                  </div>
                  <h3 className="line-clamp-2 font-semibold">{localized(e.course, "title", locale)}</h3>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-ink-500">
                      <span>{dict.learn.progress}</span>
                      <span>{e.progress}%</span>
                    </div>
                    <ProgressBar value={e.progress} />
                  </div>
                  <div className="mt-auto pt-4">
                    <ButtonLink href={`/${locale}/learn/${e.course.slug}`} variant={done ? "outline" : "primary"} className="w-full">
                      <PlayCircle className="h-4 w-4" />
                      {done ? dict.course.goToCourse : dict.dashboard.continueLearning}
                    </ButtonLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
