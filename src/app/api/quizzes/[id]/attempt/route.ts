import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { quizAttemptSchema } from "@/lib/validators";
import { ok, fail, notFound, handleError } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const { answers } = quizAttemptSchema.parse(await req.json());

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!quiz) return notFound("QUIZ_NOT_FOUND");

    // Must be enrolled in the parent course.
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: quiz.courseId } },
    });
    if (!enrollment) return fail("NOT_ENROLLED", 403);

    // Enforce attempt cap if set.
    if (quiz.maxAttempts > 0) {
      const used = await prisma.quizAttempt.count({
        where: { userId: user.id, quizId: quiz.id },
      });
      if (used >= quiz.maxAttempts) return fail("NO_ATTEMPTS_LEFT", 403);
    }

    // Grade.
    let earned = 0;
    let totalPoints = 0;
    const perQuestion: Record<string, { correct: boolean }> = {};

    for (const q of quiz.questions) {
      totalPoints += q.points;
      const correctIds = (q.correctOptionIds as string[]) ?? [];
      const given = (answers[q.id] ?? []).slice().sort();
      const expected = correctIds.slice().sort();
      const correct =
        given.length === expected.length && given.every((v, i) => v === expected[i]);
      if (correct) earned += q.points;
      perQuestion[q.id] = { correct };
    }

    const score = totalPoints ? Math.round((earned / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        score,
        passed,
        answers,
      },
    });

    return ok({ attemptId: attempt.id, score, passed, perQuestion });
  } catch (err) {
    return handleError(err);
  }
}
