"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Paperclip, ListChecks, Pencil, GripVertical } from "lucide-react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui";
import { LessonForm, type LessonDraft } from "@/components/admin/LessonForm";
import { QuizBuilder } from "@/components/admin/QuizBuilder";
import { lessonTypeIcon, lessonTypeLabels } from "@/lib/lessonMeta";
import { localized, cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";
import type { LessonType } from "@prisma/client";

type Attachment = { id: string; titleEn: string; titleAr: string; url: string; isExternal: boolean };
type Lesson = {
  id: string; titleEn: string; titleAr: string; type: LessonType;
  contentUrl: string | null; bodyEn: string | null; bodyAr: string | null;
  durationMinutes: number; isPreview: boolean;
  attachments: Attachment[]; quiz: { id: string } | null;
};
type Module = { id: string; titleEn: string; titleAr: string; lessons: Lesson[] };

export function ContentManager({
  locale,
  dict,
  courseId,
  modules,
}: {
  locale: Locale;
  dict: Dictionary;
  courseId: string;
  modules: Module[];
}) {
  const router = useRouter();
  const [addingModule, setAddingModule] = useState(false);
  const [modEn, setModEn] = useState("");
  const [modAr, setModAr] = useState("");

  async function addModule() {
    if (!modEn && !modAr) return;
    await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, titleEn: modEn || modAr, titleAr: modAr || modEn }),
    });
    setModEn(""); setModAr(""); setAddingModule(false);
    router.refresh();
  }
  async function delModule(id: string) {
    if (!confirm(dict.admin.confirmDelete)) return;
    await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {modules.map((m, mi) => (
        <div key={m.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-4 py-3">
            <GripVertical className="h-4 w-4 text-ink-300" />
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700">{mi + 1}</span>
            <span className="flex-1 font-semibold">{localized(m, "title", locale)}</span>
            <Badge tone="gray">{m.lessons.length} {dict.courses.lessons}</Badge>
            <button onClick={() => delModule(m.id)} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="divide-y divide-ink-100">
            {m.lessons.map((l) => (
              <LessonRow key={l.id} locale={locale} dict={dict} courseId={courseId} moduleId={m.id} lesson={l} />
            ))}
          </div>

          <div className="p-3">
            <AddLesson locale={locale} dict={dict} moduleId={m.id} />
          </div>
        </div>
      ))}

      {/* Add module */}
      {addingModule ? (
        <div className="flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/50 p-3">
          <Input placeholder="Module title (EN)" value={modEn} onChange={(e) => setModEn(e.target.value)} />
          <Input placeholder="عنوان الوحدة (ع)" dir="rtl" value={modAr} onChange={(e) => setModAr(e.target.value)} />
          <Button size="sm" onClick={addModule}>{dict.common.save}</Button>
          <Button size="sm" variant="ghost" onClick={() => setAddingModule(false)}>{dict.common.cancel}</Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAddingModule(true)}>
          <Plus className="h-4 w-4" /> {dict.admin.addModule}
        </Button>
      )}
    </div>
  );
}

function AddLesson({ locale, dict, moduleId }: { locale: Locale; dict: Dictionary; moduleId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {dict.admin.addLesson}
      </Button>
    );
  }
  return (
    <LessonForm
      locale={locale}
      dict={dict}
      moduleId={moduleId}
      onSaved={() => { setOpen(false); router.refresh(); }}
      onCancel={() => setOpen(false)}
    />
  );
}

function LessonRow({
  locale, dict, courseId, moduleId, lesson,
}: {
  locale: Locale; dict: Dictionary; courseId: string; moduleId: string; lesson: Lesson;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const Icon = lessonTypeIcon(lesson.type);

  async function del() {
    if (!confirm(dict.admin.confirmDelete)) return;
    await fetch(`/api/admin/lessons/${lesson.id}`, { method: "DELETE" });
    router.refresh();
  }

  const draft: LessonDraft = {
    id: lesson.id,
    titleEn: lesson.titleEn, titleAr: lesson.titleAr, type: lesson.type,
    contentUrl: lesson.contentUrl || "", bodyEn: lesson.bodyEn || "", bodyAr: lesson.bodyAr || "",
    durationMinutes: lesson.durationMinutes, isPreview: lesson.isPreview,
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-ink-400" />
        <span className="flex-1 text-sm">{localized(lesson, "title", locale)}</span>
        <span className="text-xs text-ink-400">{locale === "ar" ? lessonTypeLabels[lesson.type].ar : lessonTypeLabels[lesson.type].en}</span>
        {lesson.isPreview && <Badge tone="green">{dict.course.preview}</Badge>}
        <button onClick={() => setShowAttach((v) => !v)} className={cn("rounded-lg p-1.5 text-ink-400 hover:bg-ink-100", lesson.attachments.length && "text-brand-600")} title={dict.learn.attachments}>
          <Paperclip className="h-4 w-4" />
        </button>
        <button onClick={() => setShowQuiz((v) => !v)} className={cn("rounded-lg p-1.5 text-ink-400 hover:bg-ink-100", lesson.quiz && "text-amber-600")} title={dict.learn.quiz}>
          <ListChecks className="h-4 w-4" />
        </button>
        <button onClick={() => setEditing((v) => !v)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={del} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {editing && (
        <div className="mt-3">
          <LessonForm
            locale={locale} dict={dict} moduleId={moduleId} initial={draft}
            onSaved={() => { setEditing(false); router.refresh(); }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {showAttach && (
        <div className="mt-3">
          <AttachmentManager locale={locale} dict={dict} lessonId={lesson.id} attachments={lesson.attachments} />
        </div>
      )}

      {showQuiz && (
        <div className="mt-3">
          {lesson.quiz ? (
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
              <span className="font-medium">{dict.learn.quiz} ✓</span>
              <Button size="sm" variant="outline" onClick={async () => {
                if (!confirm(dict.admin.confirmDelete)) return;
                await fetch(`/api/admin/quizzes/${lesson.quiz!.id}`, { method: "DELETE" });
                router.refresh();
              }}>{dict.common.delete}</Button>
            </div>
          ) : (
            <QuizBuilder dict={dict} courseId={courseId} lessonId={lesson.id} onSaved={() => { setShowQuiz(false); router.refresh(); }} />
          )}
        </div>
      )}
    </div>
  );
}

function AttachmentManager({
  locale, dict, lessonId, attachments,
}: {
  locale: Locale; dict: Dictionary; lessonId: string; attachments: Attachment[];
}) {
  const router = useRouter();
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [url, setUrl] = useState("");

  async function add() {
    if (!url || (!titleEn && !titleAr)) return;
    await fetch("/api/admin/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        titleEn: titleEn || titleAr,
        titleAr: titleAr || titleEn,
        url,
        isExternal: url.startsWith("http"),
      }),
    });
    setTitleEn(""); setTitleAr(""); setUrl("");
    router.refresh();
  }
  async function del(id: string) {
    await fetch(`/api/admin/attachments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-3">
      <ul className="mb-2 space-y-1">
        {attachments.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
            <span>{localized(a, "title", locale)}</span>
            <button onClick={() => del(a.id)} className="text-ink-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <Input className="flex-1" placeholder="Title (EN)" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        <Input className="flex-1" placeholder="(ع)" dir="rtl" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
        <Input className="flex-[2]" placeholder="https://… / /uploads/…" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button size="sm" onClick={add}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
