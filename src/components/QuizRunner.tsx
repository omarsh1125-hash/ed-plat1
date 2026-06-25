"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Info, Award } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

type Option = { id: string; en: string; ar: string };
type Question = {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  promptEn: string;
  promptAr: string;
  options: Option[];
  explanationEn: string | null;
  explanationAr: string | null;
};

type Result = {
  score: number;
  passed: boolean;
  perQuestion: Record<string, { correct: boolean }>;
};

export function QuizRunner({
  locale,
  dict,
  quizId,
  passingScore,
  questions,
  backHref,
}: {
  locale: Locale;
  dict: Dictionary;
  quizId: string;
  passingScore: number;
  questions: Question[];
  backHref: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const L = (q: { en: string; ar: string } | { promptEn: string; promptAr: string }) => {
    if ("en" in q) return locale === "ar" ? q.ar : q.en;
    return locale === "ar" ? q.promptAr : q.promptEn;
  };

  function select(qId: string, optId: string) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [qId]: [optId] }));
  }

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    setBusy(false);
    if (!res.ok) return setError(dict.common.errorGeneric);
    const data = await res.json();
    setResult(data.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  const answeredAll = questions.every((q) => answers[q.id]?.length);

  return (
    <div className="mx-auto max-w-3xl">
      {result && (
        <div
          className={cn(
            "mb-6 rounded-2xl border p-6 text-center",
            result.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          )}
        >
          <span
            className={cn(
              "mx-auto grid h-14 w-14 place-items-center rounded-full",
              result.passed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            )}
          >
            {result.passed ? <Award className="h-7 w-7" /> : <Info className="h-7 w-7" />}
          </span>
          <h2 className="mt-4 text-xl font-bold">{dict.quiz.resultTitle}</h2>
          <p className="mt-1 text-3xl font-bold text-ink-900">{result.score}%</p>
          <p className="mt-1 text-sm text-ink-600">
            {result.passed ? dict.quiz.passedMessage : dict.quiz.failedMessage}
          </p>
          <Badge tone={result.passed ? "green" : "amber"} className="mt-3">
            {dict.quiz.passingScore}: {passingScore}%
          </Badge>
        </div>
      )}

      <div className="space-y-5">
        {questions.map((q, qi) => {
          const selected = answers[q.id]?.[0];
          const qResult = result?.perQuestion[q.id];
          return (
            <div key={q.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex items-start gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                  {qi + 1}
                </span>
                <p className="font-medium">{L(q)}</p>
                {qResult && (
                  qResult.correct ? (
                    <CheckCircle2 className="ms-auto h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="ms-auto h-5 w-5 text-red-500" />
                  )
                )}
              </div>

              <div className="mt-4 space-y-2">
                {q.options.map((opt) => {
                  const isSelected = selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => select(q.id, opt.id)}
                      disabled={!!result}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm transition",
                        isSelected ? "border-brand-500 bg-brand-50" : "border-ink-200 hover:border-brand-300",
                        result && "cursor-default"
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                          isSelected ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300"
                        )}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      {L(opt)}
                    </button>
                  );
                })}
              </div>

              {qResult && (q.explanationEn || q.explanationAr) && (
                <div className="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">
                  <span className="font-medium text-ink-700">{dict.quiz.explanation}: </span>
                  {locale === "ar" ? q.explanationAr || q.explanationEn : q.explanationEn || q.explanationAr}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <ButtonLink href={backHref} variant="ghost">
          {dict.quiz.backToLesson}
        </ButtonLink>
        {result ? (
          <Button variant="outline" onClick={retry}>
            {dict.quiz.retry}
          </Button>
        ) : (
          <Button onClick={submit} disabled={!answeredAll || busy}>
            {busy ? dict.common.loading : dict.quiz.submit}
          </Button>
        )}
      </div>
    </div>
  );
}
