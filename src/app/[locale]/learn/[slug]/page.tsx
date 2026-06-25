import { redirect, notFound } from "next/navigation";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { CoursePlayer } from "@/components/player/CoursePlayer";
import { localized } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: { locale: Locale; slug: string };
  searchParams: { lesson?: string };
}) {
  const { locale, slug } = params;
  const dict = getDictionary(locale);

  const session = await getCurrentSession();
  if (!session?.user) redirect(`/${locale}/login?callbackUrl=/${locale}/learn/${slug}`);

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              attachments: true,
              quiz: { select: { id: true, titleEn: true, titleAr: true } },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });
  if (!enrollment) redirect(`/${locale}/courses/${slug}`);

  const allLessons = course.modules.flatMap((m) => m.lessons);
  if (allLessons.length === 0) redirect(`/${locale}/courses/${slug}`);

  // Resolve current lesson: query param → last viewed → first lesson.
  const requested = searchParams.lesson;
  const current =
    allLessons.find((l) => l.id === requested) ||
    allLessons.find((l) => l.id === enrollment.lastLessonId) ||
    allLessons[0];

  // Record last-viewed pointer.
  if (enrollment.lastLessonId !== current.id) {
    await prisma.enrollment.update({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      data: { lastLessonId: current.id },
    });
  }

  const [progressRows, note] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: session.user.id, completed: true, lessonId: { in: allLessons.map((l) => l.id) } },
      select: { lessonId: true },
    }),
    prisma.note.findFirst({
      where: { userId: session.user.id, lessonId: current.id },
      select: { body: true },
    }),
  ]);

  const modules = course.modules.map((m) => ({
    id: m.id,
    titleEn: m.titleEn,
    titleAr: m.titleAr,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      titleEn: l.titleEn,
      titleAr: l.titleAr,
      type: l.type,
      hasQuiz: !!l.quiz,
    })),
  }));

  return (
    <CoursePlayer
      locale={locale}
      dict={dict}
      courseSlug={course.slug}
      courseTitle={localized(course, "title", locale)}
      modules={modules}
      currentLesson={{
        id: current.id,
        type: current.type,
        contentUrl: current.contentUrl,
        bodyEn: current.bodyEn,
        bodyAr: current.bodyAr,
        titleEn: current.titleEn,
        titleAr: current.titleAr,
      }}
      attachments={current.attachments.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        titleAr: a.titleAr,
        url: a.url,
        isExternal: a.isExternal,
      }))}
      quiz={current.quiz}
      initialNote={note?.body || ""}
      completedIds={progressRows.map((p) => p.lessonId)}
      initialProgress={enrollment.progress}
    />
  );
}
