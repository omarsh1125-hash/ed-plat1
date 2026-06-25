import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { recomputeProgress } from "@/lib/progress";
import { ok, fail, notFound, handleError } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const { completed } = (await req.json().catch(() => ({}))) as { completed?: boolean };

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      select: { id: true, module: { select: { courseId: true } } },
    });
    if (!lesson) return notFound("LESSON_NOT_FOUND");
    const courseId = lesson.module.courseId;

    // Must be enrolled to record progress.
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (!enrollment) return fail("NOT_ENROLLED", 403);

    const isDone = completed !== false;
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        completed: isDone,
        completedAt: isDone ? new Date() : null,
      },
      update: { completed: isDone, completedAt: isDone ? new Date() : null },
    });

    await prisma.enrollment.update({
      where: { userId_courseId: { userId: user.id, courseId } },
      data: { lastLessonId: lesson.id },
    });

    const result = await recomputeProgress(user.id, courseId);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
