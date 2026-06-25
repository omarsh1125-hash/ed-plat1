import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  Clock,
  Globe2,
  TrendingUp,
  Award,
  Search,
  GraduationCap,
  Star,
  type LucideIcon,
} from "lucide-react";
import * as Icons from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import { getDirection, type Locale } from "@/i18n/config";
import { CourseCard } from "@/components/CourseCard";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading, Badge } from "@/components/ui";
import { localized, initials } from "@/lib/utils";
import {
  getPublishedCourses,
  getCategoriesWithCounts,
  getPlatformStats,
} from "@/lib/queries";

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const dir = getDirection(locale);
  const Arrow = dir === "rtl" ? Icons.ArrowLeft : ArrowRight;

  const [featured, categories, stats] = await Promise.all([
    getPublishedCourses({ take: 6 }),
    getCategoriesWithCounts(),
    getPlatformStats(),
  ]);

  const benefits = [
    { icon: Clock, title: dict.home.benefit1Title, desc: dict.home.benefit1Desc },
    { icon: Globe2, title: dict.home.benefit2Title, desc: dict.home.benefit2Desc },
    { icon: TrendingUp, title: dict.home.benefit3Title, desc: dict.home.benefit3Desc },
    { icon: Award, title: dict.home.benefit4Title, desc: dict.home.benefit4Desc },
  ];

  const steps = [
    { icon: Search, title: dict.home.howStep1Title, desc: dict.home.howStep1Desc },
    { icon: PlayCircle, title: dict.home.howStep2Title, desc: dict.home.howStep2Desc },
    { icon: Award, title: dict.home.howStep3Title, desc: dict.home.howStep3Desc },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="container-px grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-in">
            <Badge tone="brand" className="mb-5">
              <Globe2 className="h-3.5 w-3.5" /> {dict.home.heroBadge}
            </Badge>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-500">{dict.home.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/${locale}/courses`} size="lg">
                {dict.home.heroCtaPrimary} <Arrow className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={`/${locale}/register`} variant="outline" size="lg">
                {dict.home.heroCtaSecondary}
              </ButtonLink>
            </div>
            <div className="mt-10 flex gap-8">
              <Stat value={`${stats.courses}+`} label={dict.home.statsCourses} />
              <Stat value={`${stats.students}+`} label={dict.home.statsStudents} />
              <Stat value={`${stats.certificates}+`} label={dict.home.statsCertificates} />
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-ink-100 bg-white p-3 shadow-soft">
              <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-16 w-16 opacity-90" />
                  <p className="mt-3 text-lg font-semibold">{dict.common.platformName}</p>
                  <p className="text-sm opacity-80">{dict.common.tagline}</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 ltr:-left-5 rtl:-right-5 hidden rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{dict.course.certificateIncluded}</p>
                  <p className="text-xs text-ink-500">{dict.home.benefit4Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="container-px py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow={dict.home.featuredSubtitle}
            title={dict.home.featuredTitle}
          />
          <ButtonLink href={`/${locale}/courses`} variant="ghost" className="hidden sm:inline-flex">
            {dict.common.viewAll} <Arrow className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <CourseCard key={c.slug} course={c} locale={locale} dict={dict} />
          ))}
          {featured.length === 0 && (
            <p className="text-ink-500">{dict.courses.empty}</p>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white py-16">
          <div className="container-px">
            <SectionHeading
              center
              eyebrow={dict.home.categoriesSubtitle}
              title={dict.home.categoriesTitle}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => {
                const Icon = ((Icons as Record<string, unknown>)[cat.icon || "BookOpen"] as LucideIcon) || Icons.BookOpen;
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/courses?category=${cat.slug}`}
                    className="group rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-brand-200 hover:shadow-card"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-semibold">{localized(cat, "name", locale)}</h3>
                    <p className="mt-1 text-sm text-ink-500">
                      {cat._count.courses} {dict.nav.courses}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="container-px py-16">
        <SectionHeading center eyebrow={dict.common.platformName} title={dict.home.benefitsTitle} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-ink-100 bg-white p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-950 py-16 text-white">
        <div className="container-px">
          <SectionHeading center eyebrow={dict.home.howSubtitle} title={dict.home.howTitle} />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white">
                  <s.icon className="h-6 w-6" />
                </span>
                <div className="mx-auto mt-3 grid h-7 w-7 place-items-center rounded-full bg-accent-500 text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-brand-100">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-px py-16">
        <SectionHeading center eyebrow={dict.home.testimonialsSubtitle} title={dict.home.testimonialsTitle} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {dict.testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-ink-100 bg-white p-6">
              <div className="flex gap-0.5 text-accent-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-ink-700">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {initials(t.name)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="container-px max-w-3xl">
          <SectionHeading center title={dict.home.faqTitle} />
          <div className="mt-8 divide-y divide-ink-100 rounded-2xl border border-ink-100">
            {dict.faqItems.map((f, i) => (
              <details key={i} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  {f.q}
                  <span className="text-ink-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-ink-500">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-px py-16">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">{dict.home.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">{dict.home.ctaSubtitle}</p>
          <ButtonLink href={`/${locale}/register`} variant="secondary" size="lg" className="mt-7">
            {dict.home.ctaButton} <Arrow className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-brand-700">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}
