import "server-only";
import { prisma } from "@/lib/prisma";

export async function getStudentEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      course: {
        select: {
          slug: true,
          titleEn: true,
          titleAr: true,
          thumbnailUrl: true,
          level: true,
          durationMinutes: true,
          instructorName: true,
          category: { select: { nameEn: true, nameAr: true } },
        },
      },
    },
  });
}

export async function getStudentStats(userId: string) {
  const [enrollments, completed, certificates] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId }, select: { progress: true } }),
    prisma.enrollment.count({ where: { userId, status: "COMPLETED" } }),
    prisma.certificate.count({ where: { userId } }),
  ]);
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
    : 0;
  return {
    enrolled: enrollments.length,
    completed,
    certificates,
    avgProgress,
  };
}
