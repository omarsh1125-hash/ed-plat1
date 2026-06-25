import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { quizSchema } from "@/lib/validators";
import { created, handleError } from "@/lib/api";

// Creates (or replaces) a quiz with its full question set in one call.
export async function POST(req: NextRequest) {
  try {
    await assertAdmin();
    const data = quizSchema.parse(await req.json());

    // A lesson can have at most one quiz; replace if exists.
    if (data.lessonId) {
      const existing = await prisma.quiz.findUnique({ where: { lessonId: data.lessonId } });
      if (existing) await prisma.quiz.delete({ where: { id: existing.id } });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId: data.courseId,
        lessonId: data.lessonId || null,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        descEn: data.descEn ?? null,
        descAr: data.descAr ?? null,
        passingScore: data.passingScore,
        maxAttempts: data.maxAttempts,
        questions: {
          create: data.questions.map((q, i) => ({
            type: q.type,
            promptEn: q.promptEn,
            promptAr: q.promptAr,
            options: q.options,
            correctOptionIds: q.correctOptionIds,
            explanationEn: q.explanationEn ?? null,
            explanationAr: q.explanationAr ?? null,
            points: q.points,
            order: i,
          })),
        },
      },
      select: { id: true },
    });

    return created(quiz);
  } catch (err) {
    return handleError(err);
  }
}
