"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

/**
 * Renders a course thumbnail with a graceful fallback. If no URL is provided —
 * or the image fails to load (404, blocked host, bad admin-entered URL) — it
 * degrades to a branded gradient placeholder instead of a broken-image icon.
 */
export function CourseThumbnail({
  src,
  alt,
  className = "",
  iconClassName = "h-10 w-10",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500 to-brand-700 text-white">
      <BookOpen className={`${iconClassName} opacity-80`} aria-hidden />
      <span className="sr-only">{alt}</span>
    </div>
  );
}
