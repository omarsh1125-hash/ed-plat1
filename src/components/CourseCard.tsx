import Link from "next/link";
import { Clock, BarChart3, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";
import { localized, formatPrice, formatDuration } from "@/lib/utils";

export type CourseCardData = {
  slug: string;
  titleEn: string;
  titleAr: string;
  shortDescEn: string | null;
  shortDescAr: string | null;
  thumbnailUrl: string | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  durationMinutes: number;
  isFree: boolean;
  price: number;
  currency: string;
  instructorName: string | null;
  category?: { nameEn: string; nameAr: string } | null;
  _count?: { enrollments?: number };
  lessonCount?: number;
};

const levelTone = {
  BEGINNER: "green",
  INTERMEDIATE: "amber",
  ADVANCED: "purple",
} as const;

export function CourseCard({
  course,
  locale,
  dict,
}: {
  course: CourseCardData;
  locale: Locale;
  dict: Dictionary;
}) {
  const title = localized(course, "title", locale);
  const desc = localized(course, "shortDesc", locale);
  const category = course.category ? localized(course.category, "name", locale) : null;

  return (
    <Link
      href={`/${locale}/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-100">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <BookOpen className="h-10 w-10 opacity-80" />
          </div>
        )}
        <div className="absolute top-3 ltr:left-3 rtl:right-3">
          <Badge tone={course.isFree ? "green" : "brand"}>
            {course.isFree ? dict.common.free : formatPrice(course.price, course.currency, locale)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          {category && <span className="text-xs font-medium text-brand-600">{category}</span>}
          <Badge tone={levelTone[course.level]} className="ms-auto">
            {dict.courses[`level_${course.level}` as keyof typeof dict.courses] as string}
          </Badge>
        </div>
        <h3 className="line-clamp-2 font-semibold text-ink-900 group-hover:text-brand-700">
          {title}
        </h3>
        {desc && <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">{desc}</p>}

        <div className="mt-4 flex items-center gap-4 border-t border-ink-100 pt-3 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.durationMinutes, locale)}
          </span>
          {typeof course.lessonCount === "number" && (
            <span className="inline-flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              {course.lessonCount} {dict.courses.lessons}
            </span>
          )}
          {course.instructorName && (
            <span className="ms-auto truncate max-w-[40%]">{course.instructorName}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
