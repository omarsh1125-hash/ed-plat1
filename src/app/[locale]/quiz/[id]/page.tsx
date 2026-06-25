import { redirect, notFound } from "next/navigation";
import { ListChecks } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { QuizRunner } from "@/components/QuizRunner";
import { Badge } from "@/components/ui";
import { localized } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  params,
}: {
  params: { locale: Locale; id: string };
}) {
  const { locale, id } = params;
  const dict = getDictionary(locale);

  const session = await getCurrentSession();
  if (!session?.user) redirect(`/${locale}/login`);

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      course: { select: { slug: true } },
      questions: { orderBy: { order: "asc" } },
      lesson: { select: { id: true } },
    },
  });
  if (!quiz) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: quiz.courseId } },
  });
  if (!enrollment) redirect(`/${locale}/courses/${quiz.course.slug}`);

  // Strip correct answers before sending to the client; grading is server-side.
  const questions = quiz.questions.map((q) => ({
    id: q.id,
    type: q.type,
    promptEn: q.promptEn,
    promptAr: q.promptAr,
    options: q.options as { id: string; en: string; ar: string }[],
    explanationEn: q.explanationEn,
    explanationAr: q.explanationAr,
  }));

  const backHref = quiz.lesson
    ? `/${locale}/learn/${quiz.course.slug}?lesson=${quiz.lesson.id}`
    : `/${locale}/learn/${quiz.course.slug}`;

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="container-px max-w-3xl py-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <ListChecks className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">{localized(quiz, "title", locale)}</h1>
            <div className="mt-1 flex gap-2 text-xs">
              <Badge tone="brand">{questions.length} {dict.quiz.question}</Badge>
              <Badge tone="amber">{dict.quiz.passingScore}: {quiz.passingScore}%</Badge>
            </div>
          </div>
        </div>

        <QuizRunner
          locale={locale}
          dict={dict}
          quizId={quiz.id}
          passingScore={quiz.passingScore}
          questions={questions}
          backHref={backHref}
        />
      </div>
    </div>
  );
}
