import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { CourseCard } from "@/components/CourseCard";
import { CourseFilters } from "@/components/CourseFilters";
import { EmptyState } from "@/components/ui";
import { getPublishedCourses, getCategoriesWithCounts } from "@/lib/queries";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = {
  category?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  search?: string;
  free?: string;
};

export default async function CoursesPage({
  params,
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: SearchParams;
}) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const [courses, categories] = await Promise.all([
    getPublishedCourses({
      categorySlug: searchParams.category,
      level: searchParams.level,
      search: searchParams.search,
      free: searchParams.free === "1" ? true : undefined,
    }),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="container-px py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{dict.courses.title}</h1>
        <p className="mt-2 text-ink-500">{dict.courses.subtitle}</p>
      </header>

      <div className="mb-8">
        <CourseFilters locale={locale} dict={dict} categories={categories} />
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-10 w-10" />} title={dict.courses.empty} />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-500">
            {courses.length} {dict.nav.courses}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.slug} course={c} locale={locale} dict={dict} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
