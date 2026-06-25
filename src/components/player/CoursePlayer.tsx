"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ListChecks,
  Menu,
  X,
  Paperclip,
  GraduationCap,
} from "lucide-react";
import { LessonContent, type PlayerLesson } from "./LessonContent";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProgressBar, Badge } from "@/components/ui";
import { lessonTypeIcon } from "@/lib/lessonMeta";
import { cn, localized } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

type LessonLite = {
  id: string;
  titleEn: string;
  titleAr: string;
  type: PlayerLesson["type"];
  hasQuiz: boolean;
};
type ModuleLite = { id: string; titleEn: string; titleAr: string; lessons: LessonLite[] };
type Attachment = { id: string; titleEn: string; titleAr: string; url: string; isExternal: boolean };

export function CoursePlayer({
  locale,
  dict,
  courseSlug,
  courseTitle,
  modules,
  currentLesson,
  attachments,
  quiz,
  initialNote,
  completedIds,
  initialProgress,
}: {
  locale: Locale;
  dict: Dictionary;
  courseSlug: string;
  courseTitle: string;
  modules: ModuleLite[];
  currentLesson: PlayerLesson;
  attachments: Attachment[];
  quiz: { id: string; titleEn: string; titleAr: string } | null;
  initialNote: string;
  completedIds: string[];
  initialProgress: number;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set(completedIds));
  const [progress, setProgress] = useState(initialProgress);
  const [note, setNote] = useState(initialNote);
  const [noteSaved, setNoteSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [justCompletedCourse, setJustCompletedCourse] = useState(false);

  // Flatten lessons for prev/next navigation.
  const flat = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const idx = flat.findIndex((l) => l.id === currentLesson.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  const isDone = completed.has(currentLesson.id);

  function go(lessonId: string) {
    router.push(`/${locale}/learn/${courseSlug}?lesson=${lessonId}`);
    setSidebarOpen(false);
  }

  async function toggleComplete() {
    setBusy(true);
    const target = !isDone;
    const res = await fetch(`/api/lessons/${currentLesson.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: target }),
    });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    setCompleted((prevSet) => {
      const n = new Set(prevSet);
      if (target) n.add(currentLesson.id);
      else n.delete(currentLesson.id);
      return n;
    });
    setProgress(data.data.progress);
    if (data.data.certificateIssued) setJustCompletedCourse(true);
    router.refresh();
    if (target && next) go(next.id);
  }

  async function saveNote() {
    setBusy(true);
    const res = await fetch(`/api/lessons/${currentLesson.id}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: note }),
    });
    setBusy(false);
    if (res.ok) {
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    }
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-100 p-4">
        <Link href={`/${locale}/courses/${courseSlug}`} className="flex items-center gap-2 text-sm font-medium text-brand-700">
          <GraduationCap className="h-4 w-4" /> {dict.learn.backToCourse}
        </Link>
        <h2 className="mt-3 line-clamp-2 font-bold">{courseTitle}</h2>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-ink-500">
            <span>{dict.learn.progress}</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {modules.map((m, mi) => (
          <div key={m.id} className="mb-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {mi + 1}. {localized(m, "title", locale)}
            </p>
            <ul>
              {m.lessons.map((l) => {
                const Icon = lessonTypeIcon(l.type);
                const done = completed.has(l.id);
                const active = l.id === currentLesson.id;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => go(l.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition",
                        active ? "bg-brand-50 font-medium text-brand-700" : "text-ink-600 hover:bg-ink-50"
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                          done ? "border-emerald-500 bg-emerald-500 text-white" : "border-ink-300 text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <Icon className="h-4 w-4 shrink-0 text-ink-400" />
                      <span className="line-clamp-2 flex-1">{localized(l, "title", locale)}</span>
                      {l.hasQuiz && <ListChecks className="h-3.5 w-3.5 text-amber-500" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-ink-100 bg-white lg:block ltr:border-r rtl:border-l">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 w-80 max-w-[85%] bg-white ltr:left-0 rtl:right-0">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-3 rounded-lg p-2 hover:bg-ink-100 ltr:right-3 rtl:left-3">
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
          {/* Mobile header */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg border border-ink-200 bg-white p-2">
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">{progress}% · {dict.learn.progress}</span>
          </div>

          {justCompletedCourse && (
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <span className="flex items-center gap-2 font-medium text-emerald-800">
                <CheckCircle2 className="h-5 w-5" /> {dict.learn.completedCourse}
              </span>
              <ButtonLink href={`/${locale}/dashboard/certificates`} size="sm" variant="secondary">
                {dict.learn.viewCertificate}
              </ButtonLink>
            </div>
          )}

          <h1 className="mb-4 text-2xl font-bold">{localized(currentLesson, "title", locale)}</h1>

          <LessonContent lesson={currentLesson} locale={locale} dict={dict} />

          {/* Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {prev ? (
                <Button variant="outline" size="sm" onClick={() => go(prev.id)}>
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {dict.learn.prevLesson}
                </Button>
              ) : <span />}
              {next && (
                <Button variant="outline" size="sm" onClick={() => go(next.id)}>
                  {dict.learn.nextLesson} <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              )}
            </div>
            <Button
              variant={isDone ? "outline" : "primary"}
              onClick={toggleComplete}
              disabled={busy}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isDone ? dict.learn.markedComplete : dict.learn.markComplete}
            </Button>
          </div>

          {/* Quiz */}
          {quiz && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <ListChecks className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{dict.learn.quiz}</p>
                  <p className="text-sm text-ink-500">{localized(quiz, "title", locale)}</p>
                </div>
              </div>
              <ButtonLink href={`/${locale}/quiz/${quiz.id}`} variant="secondary" size="sm">
                {dict.learn.startQuiz}
              </ButtonLink>
            </div>
          )}

          {/* Attachments */}
          <section className="mt-8">
            <h3 className="flex items-center gap-2 font-semibold">
              <Paperclip className="h-4 w-4" /> {dict.learn.attachments}
            </h3>
            {attachments.length === 0 ? (
              <p className="mt-2 text-sm text-ink-400">{dict.learn.noAttachments}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm hover:border-brand-200"
                    >
                      <span className="font-medium text-ink-700">{localized(a, "title", locale)}</span>
                      <span className="inline-flex items-center gap-1 text-brand-600">
                        {a.isExternal ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                        {a.isExternal ? dict.learn.openLink : dict.learn.download}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Notes */}
          <section className="mt-8">
            <h3 className="font-semibold">{dict.learn.notes}</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={dict.learn.notesPlaceholder}
              className="input-base mt-3 min-h-[120px]"
            />
            <div className="mt-2 flex items-center gap-3">
              <Button size="sm" onClick={saveNote} disabled={busy}>
                {dict.learn.saveNote}
              </Button>
              {noteSaved && <span className="text-sm text-emerald-600">{dict.admin.savedSuccess}</span>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
