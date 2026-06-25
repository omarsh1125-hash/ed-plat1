import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const courseCardSelect = {
  slug: true,
  titleEn: true,
  titleAr: true,
  shortDescEn: true,
  shortDescAr: true,
  thumbnailUrl: true,
  level: true,
  durationMinutes: true,
  isFree: true,
  price: true,
  currency: true,
  instructorName: true,
  category: { select: { nameEn: true, nameAr: true } },
  _count: { select: { enrollments: true } },
  modules: { select: { _count: { select: { lessons: true } } } },
} satisfies Prisma.CourseSelect;

type RawCard = Prisma.CourseGetPayload<{ select: typeof courseCardSelect }>;

export function withLessonCount(c: RawCard) {
  const lessonCount = c.modules.reduce((sum, m) => sum + m._count.lessons, 0);
  const { modules, ...rest } = c;
  return { ...rest, lessonCount };
}

export async function getPublishedCourses(args?: {
  categorySlug?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  search?: string;
  free?: boolean;
  featuredOnly?: boolean;
  take?: number;
}) {
  const where: Prisma.CourseWhereInput = { status: "PUBLISHED" };
  if (args?.categorySlug) where.category = { slug: args.categorySlug };
  if (args?.level) where.level = args.level;
  if (typeof args?.free === "boolean") where.isFree = args.free;
  if (args?.featuredOnly) where.featured = true;
  if (args?.search) {
    where.OR = [
      { titleEn: { contains: args.search, mode: "insensitive" } },
      { titleAr: { contains: args.search } },
      { shortDescEn: { contains: args.search, mode: "insensitive" } },
      { shortDescAr: { contains: args.search } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    select: courseCardSelect,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: args?.take,
  });
  return courses.map(withLessonCount);
}

export async function getCategoriesWithCounts() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
    },
  });
}

export async function getPlatformStats() {
  const [courses, students, certificates] = await Promise.all([
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.certificate.count(),
  ]);
  return { courses, students, certificates };
}
