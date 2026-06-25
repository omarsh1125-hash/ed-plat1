import "server-only";
import { prisma } from "@/lib/prisma";
import { generateSerial } from "@/lib/utils";

/**
 * Recalculate an enrollment's progress percentage from completed lessons,
 * update status, and auto-issue a certificate on 100% completion.
 * Returns the updated progress and whether a certificate was just created.
 */
export async function recomputeProgress(userId: string, courseId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });
  const total = lessons.length;
  const lessonIds = lessons.map((l) => l.id);

  const completed = total
    ? await prisma.lessonProgress.count({
        where: { userId, completed: true, lessonId: { in: lessonIds } },
      })
    : 0;

  const progress = total ? Math.round((completed / total) * 100) : 0;
  const isComplete = total > 0 && completed >= total;

  await prisma.enrollment.update({
    where: { userId_courseId: { userId, courseId } },
    data: {
      progress,
      status: isComplete ? "COMPLETED" : "ACTIVE",
      completedAt: isComplete ? new Date() : null,
    },
  });

  let certificateIssued = false;
  if (isComplete) {
    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!existing) {
      const [user, course] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.course.findUnique({ where: { id: courseId } }),
      ]);
      if (user && course) {
        await prisma.certificate.create({
          data: {
            serial: generateSerial(),
            userId,
            courseId,
            studentName: user.name,
            courseTitleEn: course.titleEn,
            courseTitleAr: course.titleAr,
          },
        });
        certificateIssued = true;
      }
    }
  }

  return { progress, isComplete, certificateIssued };
}
