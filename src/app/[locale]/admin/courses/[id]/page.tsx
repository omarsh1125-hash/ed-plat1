import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { CourseForm, type CourseFormData } from "@/components/admin/CourseForm";
import { ContentManager } from "@/components/admin/ContentManager";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type Pair = { en: string; ar: string };

export default async function EditCoursePage({
  params,
}: {
  params: { locale: Locale; id: string };
}) {
  const { locale, id } = params;
  const dict = getDictionary(locale);

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: { attachments: true, quiz: { select: { id: true } } },
            },
          },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, nameEn: true, nameAr: true } }),
  ]);

  if (!course) notFound();

  const initial: CourseFormData = {
    id: course.id,
    titleEn: course.titleEn, titleAr: course.titleAr,
    shortDescEn: course.shortDescEn || "", shortDescAr: course.shortDescAr || "",
    descriptionEn: course.descriptionEn, descriptionAr: course.descriptionAr,
    thumbnailUrl: course.thumbnailUrl || "", promoVideoUrl: course.promoVideoUrl || "",
    level: course.level, status: course.status,
    durationMinutes: course.durationMinutes, instructorName: course.instructorName || "",
    isFree: course.isFree, price: course.price, currency: course.currency,
    categoryId: course.categoryId || "", featured: course.featured,
    objectives: (course.objectives as Pair[]) || [],
    requirements: (course.requirements as Pair[]) || [],
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/admin/courses`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {dict.admin.courseManagement}
        </Link>
        <ButtonLink href={`/${locale}/courses/${course.slug}`} variant="outline" size="sm">
          <ExternalLink className="h-4 w-4" /> {dict.common.view}
        </ButtonLink>
      </div>

      <h1 className="text-2xl font-bold">{dict.admin.editCourse}</h1>

      <CourseForm locale={locale} dict={dict} categories={categories} initial={initial} />

      <section>
        <h2 className="mb-4 text-xl font-bold">{dict.admin.manageContent}</h2>
        <ContentManager locale={locale} dict={dict} courseId={course.id} modules={course.modules} />
      </section>
    </div>
  );
}
