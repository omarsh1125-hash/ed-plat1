import { notFound } from "next/navigation";
import {
  Clock,
  BarChart3,
  CheckCircle2,
  PlayCircle,
  FileText,
  Award,
  User,
  Globe2,
  Lock,
  ListChecks,
} from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { Badge, ProgressBar } from "@/components/ui";
import { EnrollButton } from "@/components/EnrollButton";
import { localized, formatPrice, formatDuration } from "@/lib/utils";
import { lessonTypeIcon } from "@/lib/lessonMeta";

export const dynamic = "force-dynamic";

type LocalizedPair = { en: string; ar: string };

export default async function CourseDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  const { locale, slug } = params;
  const dict = getDictionary(locale);

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              titleEn: true,
              titleAr: true,
              type: true,
              durationMinutes: true,
              isPreview: true,
            },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course || course.status !== "PUBLISHED") notFound();

  const session = await getCurrentSession();
  const enrollment = session?.user
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      })
    : null;

  const title = localized(course, "title", locale);
  const description = localized(course, "description", locale);
  const objectives = (course.objectives as LocalizedPair[]) || [];
  const requirements = (course.requirements as LocalizedPair[]) || [];
  const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const priceLabel = course.isFree
    ? dict.common.free
    : formatPrice(course.price, course.currency, locale);

  return (
    <div>
      {/* Header band */}
      <div className="bg-brand-950 text-white">
        <div className="container-px grid gap-8 py-12 lg:grid-cols-3 lg:py-16">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              {course.category && (
                <Badge tone="brand">{localized(course.category, "name", locale)}</Badge>
              )}
              <Badge tone="amber">
                {dict.courses[`level_${course.level}` as keyof typeof dict.courses] as string}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-brand-100">{localized(course, "shortDesc", locale)}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-100">
              {course.instructorName && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {course.instructorName}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {formatDuration(course.durationMinutes, locale)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" /> {lessonCount} {dict.courses.lessons}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" /> {course._count.enrollments} {dict.courses.students}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-4 w-4" /> {dict.common.english} · {dict.common.arabic}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px grid gap-8 py-12 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-10 lg:col-span-2">
          {description && (
            <section>
              <h2 className="text-xl font-bold">{dict.course.overview}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-600">{description}</p>
            </section>
          )}

          {objectives.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">{dict.course.objectives}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {objectives.map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    {locale === "ar" ? o.ar || o.en : o.en || o.ar}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Curriculum */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{dict.course.curriculum}</h2>
              <span className="text-sm text-ink-500">
                {course.modules.length} {dict.courses.modules} · {lessonCount} {dict.courses.lessons}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {course.modules.map((m, idx) => (
                <details key={m.id} className="group rounded-xl border border-ink-100 bg-white" open={idx === 0}>
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                        {idx + 1}
                      </span>
                      {localized(m, "title", locale)}
                    </span>
                    <span className="text-sm text-ink-400">
                      {m.lessons.length} {dict.courses.lessons}
                    </span>
                  </summary>
                  <ul className="divide-y divide-ink-100 border-t border-ink-100">
                    {m.lessons.map((l) => {
                      const Icon = lessonTypeIcon(l.type);
                      const canPreview = l.isPreview || !!enrollment;
                      return (
                        <li key={l.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                          <Icon className="h-4 w-4 text-ink-400" />
                          <span className="flex-1 text-ink-700">{localized(l, "title", locale)}</span>
                          {l.isPreview && <Badge tone="green">{dict.course.preview}</Badge>}
                          {!canPreview && <Lock className="h-3.5 w-3.5 text-ink-300" />}
                          {l.durationMinutes > 0 && (
                            <span className="text-xs text-ink-400">
                              {formatDuration(l.durationMinutes, locale)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                    {m.lessons.length === 0 && (
                      <li className="px-4 py-3 text-sm text-ink-400">{dict.common.comingSoon}</li>
                    )}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          {requirements.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">{dict.course.requirements}</h2>
              <ul className="mt-4 space-y-2">
                {requirements.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-700">
                    <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                    {locale === "ar" ? r.ar || r.en : r.en || r.ar}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sticky enroll card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <div className="aspect-[16/9] bg-ink-100">
              {course.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.thumbnailUrl} alt={title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                  <PlayCircle className="h-12 w-12 opacity-80" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-ink-900">{priceLabel}</span>
                {enrollment && <Badge tone="green">{dict.course.alreadyEnrolled}</Badge>}
              </div>

              {enrollment && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-ink-500">
                    <span>{dict.learn.progress}</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <ProgressBar value={enrollment.progress} />
                </div>
              )}

              <div className="mt-5">
                <EnrollButton
                  slug={course.slug}
                  locale={locale}
                  dict={dict}
                  isFree={course.isFree}
                  priceLabel={priceLabel}
                  enrolled={!!enrollment}
                />
              </div>

              <ul className="mt-6 space-y-3 text-sm text-ink-600">
                <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-brand-500" /> {lessonCount} {dict.courses.lessons}</li>
                <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-500" /> {formatDuration(course.durationMinutes, locale)}</li>
                <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-500" /> {dict.learn.attachments}</li>
                <li className="flex items-center gap-2"><Award className="h-4 w-4 text-brand-500" /> {dict.course.certificateIncluded}</li>
                <li className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-brand-500" /> {dict.common.english} · {dict.common.arabic}</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
