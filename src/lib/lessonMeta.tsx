import {
  PlayCircle,
  Video,
  FileText,
  Presentation,
  FileType2,
  ImageIcon,
  AlignLeft,
  Music,
  Link2,
  type LucideIcon,
} from "lucide-react";
import type { LessonType } from "@prisma/client";

const map: Record<LessonType, LucideIcon> = {
  VIDEO_UPLOAD: Video,
  VIDEO_EMBED: PlayCircle,
  PDF: FileText,
  SLIDES: Presentation,
  DOCUMENT: FileType2,
  IMAGE: ImageIcon,
  TEXT: AlignLeft,
  AUDIO: Music,
  EXTERNAL_LINK: Link2,
};

export function lessonTypeIcon(type: LessonType): LucideIcon {
  return map[type] ?? AlignLeft;
}

export const lessonTypeLabels: Record<LessonType, { en: string; ar: string }> = {
  VIDEO_UPLOAD: { en: "Uploaded video", ar: "فيديو مرفوع" },
  VIDEO_EMBED: { en: "Embedded video", ar: "فيديو مضمّن" },
  PDF: { en: "PDF", ar: "ملف PDF" },
  SLIDES: { en: "Slides", ar: "شرائح عرض" },
  DOCUMENT: { en: "Document", ar: "مستند" },
  IMAGE: { en: "Image", ar: "صورة" },
  TEXT: { en: "Text lesson", ar: "درس نصّي" },
  AUDIO: { en: "Audio", ar: "ملف صوتي" },
  EXTERNAL_LINK: { en: "External link", ar: "رابط خارجي" },
};
