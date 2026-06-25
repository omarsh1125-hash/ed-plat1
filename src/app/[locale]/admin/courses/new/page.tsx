import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/admin/CourseForm";

export const dynamic = "force-dynamic";

export default async function NewCoursePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, nameEn: true, nameAr: true },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <Link href={`/${locale}/admin/courses`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {dict.admin.courseManagement}
      </Link>
      <h1 className="text-2xl font-bold">{dict.admin.newCourse}</h1>
      <CourseForm locale={locale} dict={dict} categories={categories} />
    </div>
  );
}
