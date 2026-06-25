"use client";

import { FileText, Download, ExternalLink, Music } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";

export type PlayerLesson = {
  id: string;
  type:
    | "VIDEO_UPLOAD"
    | "VIDEO_EMBED"
    | "PDF"
    | "SLIDES"
    | "DOCUMENT"
    | "IMAGE"
    | "TEXT"
    | "AUDIO"
    | "EXTERNAL_LINK";
  contentUrl: string | null;
  bodyEn: string | null;
  bodyAr: string | null;
  titleEn: string;
  titleAr: string;
};

/** Convert common video URLs to an embeddable form. */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("vimeo.com") && /^\/\d+/.test(u.pathname)) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}

export function LessonContent({
  lesson,
  locale,
  dict,
}: {
  lesson: PlayerLesson;
  locale: Locale;
  dict: Dictionary;
}) {
  const body = locale === "ar" ? lesson.bodyAr || lesson.bodyEn : lesson.bodyEn || lesson.bodyAr;
  const url = lesson.contentUrl || "";

  switch (lesson.type) {
    case "VIDEO_UPLOAD":
      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {url ? (
            <video src={url} controls className="h-full w-full" />
          ) : (
            <Placeholder dict={dict} />
          )}
        </div>
      );

    case "VIDEO_EMBED":
      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {url ? (
            <iframe
              src={toEmbedUrl(url)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Placeholder dict={dict} />
          )}
        </div>
      );

    case "PDF":
    case "SLIDES":
    case "DOCUMENT":
      return (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
          {url ? (
            <>
              <iframe
                src={lesson.type === "PDF" ? url : `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`}
                className="h-[70vh] w-full"
              />
              <div className="flex items-center justify-between border-t border-ink-100 p-3">
                <span className="flex items-center gap-2 text-sm text-ink-500">
                  <FileText className="h-4 w-4" /> {locale === "ar" ? lesson.titleAr : lesson.titleEn}
                </span>
                <a href={url} download className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                  <Download className="h-4 w-4" /> {dict.learn.download}
                </a>
              </div>
            </>
          ) : (
            <Placeholder dict={dict} />
          )}
        </div>
      );

    case "IMAGE":
      return url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={locale === "ar" ? lesson.titleAr : lesson.titleEn} className="w-full rounded-xl border border-ink-100" />
      ) : (
        <Placeholder dict={dict} />
      );

    case "AUDIO":
      return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-ink-100 bg-white p-8">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Music className="h-7 w-7" />
          </span>
          {url ? <audio src={url} controls className="w-full" /> : <Placeholder dict={dict} />}
        </div>
      );

    case "EXTERNAL_LINK":
      return (
        <div className="rounded-xl border border-ink-100 bg-white p-8 text-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
          >
            <ExternalLink className="h-4 w-4" /> {dict.learn.openLink}
          </a>
        </div>
      );

    case "TEXT":
    default:
      return (
        <article className="prose-rtl rounded-xl border border-ink-100 bg-white p-6 leading-relaxed text-ink-700">
          {body ? (
            body.split("\n").map((line, i) => <p key={i} className="mb-3">{line}</p>)
          ) : (
            <p className="text-ink-400">{dict.common.comingSoon}</p>
          )}
        </article>
      );
  }
}

function Placeholder({ dict }: { dict: Dictionary }) {
  return (
    <div className="grid h-full min-h-[200px] w-full place-items-center text-sm text-white/70">
      {dict.common.comingSoon}
    </div>
  );
}
