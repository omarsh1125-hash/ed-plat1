"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea, Select, Label } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/getDictionary";
import type { QuestionType } from "@prisma/client";

type Option = { id: string; en: string; ar: string };
type QuestionDraft = {
  type: QuestionType;
  promptEn: string;
  promptAr: string;
  options: Option[];
  correctOptionIds: string[];
  explanationEn: string;
  explanationAr: string;
  points: number;
};

const uid = () => Math.random().toString(36).slice(2, 9);

function newQuestion(type: QuestionType): QuestionDraft {
  if (type === "TRUE_FALSE") {
    const t = { id: uid(), en: "True", ar: "صحيح" };
    const f = { id: uid(), en: "False", ar: "خطأ" };
    return { type, promptEn: "", promptAr: "", options: [t, f], correctOptionIds: [t.id], explanationEn: "", explanationAr: "", points: 1 };
  }
  const opts = [
    { id: uid(), en: "", ar: "" },
    { id: uid(), en: "", ar: "" },
  ];
  return { type, promptEn: "", promptAr: "", options: opts, correctOptionIds: [], explanationEn: "", explanationAr: "", points: 1 };
}

export function QuizBuilder({
  dict,
  courseId,
  lessonId,
  existingQuizId,
  onSaved,
}: {
  dict: Dictionary;
  courseId: string;
  lessonId: string;
  existingQuizId?: string;
  onSaved: () => void;
}) {
  const [titleEn, setTitleEn] = useState("Quiz");
  const [titleAr, setTitleAr] = useState("اختبار");
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion("MULTIPLE_CHOICE")]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateQ(i: number, patch: Partial<QuestionDraft>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function addOption(qi: number) {
    setQuestions((qs) => qs.map((q, idx) => (idx === qi ? { ...q, options: [...q.options, { id: uid(), en: "", ar: "" }] } : q)));
  }
  function setOption(qi: number, oi: number, side: "en" | "ar", value: string) {
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== qi) return q;
        const options = q.options.map((o, j) => (j === oi ? { ...o, [side]: value } : o));
        return { ...q, options };
      })
    );
  }

  async function save() {
    setError("");
    // Validate each question has a correct option.
    for (const q of questions) {
      if (!q.correctOptionIds.length) return setError(dict.quiz.selectAnswer);
    }
    setSaving(true);
    if (existingQuizId) {
      await fetch(`/api/admin/quizzes/${existingQuizId}`, { method: "DELETE" });
    }
    const res = await fetch("/api/admin/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        lessonId,
        titleEn,
        titleAr,
        passingScore,
        maxAttempts: 0,
        questions: questions.map((q) => ({
          type: q.type,
          promptEn: q.promptEn,
          promptAr: q.promptAr,
          options: q.options,
          correctOptionIds: q.correctOptionIds,
          explanationEn: q.explanationEn || null,
          explanationAr: q.explanationAr || null,
          points: q.points,
        })),
      }),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else setError(dict.common.errorGeneric);
  }

  return (
    <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>{dict.admin.courseTitle} (EN)</Label><Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} /></div>
        <div><Label>{dict.admin.courseTitle} (ع)</Label><Input dir="rtl" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} /></div>
        <div><Label>{dict.admin.passingScore}</Label><Input type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} /></div>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-ink-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">{dict.quiz.question} {qi + 1}</span>
            <div className="flex items-center gap-2">
              <Select
                value={q.type}
                onChange={(e) => updateQ(qi, newQuestion(e.target.value as QuestionType))}
                className="h-9 w-auto py-1 text-xs"
              >
                <option value="MULTIPLE_CHOICE">Multiple choice</option>
                <option value="TRUE_FALSE">True / False</option>
              </Select>
              {questions.length > 1 && (
                <button onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))} className="text-ink-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Prompt (EN)" value={q.promptEn} onChange={(e) => updateQ(qi, { promptEn: e.target.value })} />
            <Input placeholder="السؤال (ع)" dir="rtl" value={q.promptAr} onChange={(e) => updateQ(qi, { promptAr: e.target.value })} />
          </div>

          <div className="mt-3 space-y-2">
            {q.options.map((o, oi) => (
              <div key={o.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correctOptionIds.includes(o.id)}
                  onChange={() => updateQ(qi, { correctOptionIds: [o.id] })}
                  className="h-4 w-4"
                  title={dict.quiz.correct}
                />
                <Input
                  placeholder="Option (EN)"
                  value={o.en}
                  disabled={q.type === "TRUE_FALSE"}
                  onChange={(e) => setOption(qi, oi, "en", e.target.value)}
                />
                <Input
                  placeholder="(ع)"
                  dir="rtl"
                  value={o.ar}
                  disabled={q.type === "TRUE_FALSE"}
                  onChange={(e) => setOption(qi, oi, "ar", e.target.value)}
                />
              </div>
            ))}
            {q.type === "MULTIPLE_CHOICE" && (
              <button onClick={() => addOption(qi)} className="text-xs font-medium text-brand-600 hover:underline">
                + {dict.common.add}
              </button>
            )}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Textarea placeholder={`${dict.quiz.explanation} (EN)`} className="min-h-[60px]" value={q.explanationEn} onChange={(e) => updateQ(qi, { explanationEn: e.target.value })} />
            <Textarea placeholder={`${dict.quiz.explanation} (ع)`} dir="rtl" className="min-h-[60px]" value={q.explanationAr} onChange={(e) => updateQ(qi, { explanationAr: e.target.value })} />
          </div>
        </div>
      ))}

      <Button size="sm" variant="outline" onClick={() => setQuestions((qs) => [...qs, newQuestion("MULTIPLE_CHOICE")])}>
        <Plus className="h-4 w-4" /> {dict.admin.addQuestion}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? dict.common.saving : dict.common.save}
        </Button>
      </div>
    </div>
  );
}
