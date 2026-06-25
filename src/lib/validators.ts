import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  password: z.string().min(8).max(100),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  locale: z.enum(["EN", "AR"]).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

const localizedString = z.object({ en: z.string(), ar: z.string() });

export const courseSchema = z.object({
  slug: z.string().min(2).max(120).optional(),
  titleEn: z.string().min(2).max(160),
  titleAr: z.string().min(2).max(160),
  shortDescEn: z.string().max(300).optional().nullable(),
  shortDescAr: z.string().max(300).optional().nullable(),
  descriptionEn: z.string().optional().default(""),
  descriptionAr: z.string().optional().default(""),
  thumbnailUrl: z.string().optional().nullable(),
  promoVideoUrl: z.string().optional().nullable(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  durationMinutes: z.coerce.number().int().min(0).default(0),
  instructorName: z.string().max(120).optional().nullable(),
  isFree: z.boolean().default(true),
  price: z.coerce.number().int().min(0).default(0),
  currency: z.string().length(3).default("USD"),
  categoryId: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  objectives: z.array(localizedString).optional().default([]),
  requirements: z.array(localizedString).optional().default([]),
});

export const moduleSchema = z.object({
  courseId: z.string(),
  titleEn: z.string().min(1).max(160),
  titleAr: z.string().min(1).max(160),
  order: z.coerce.number().int().min(0).optional(),
});

export const lessonSchema = z.object({
  moduleId: z.string(),
  titleEn: z.string().min(1).max(160),
  titleAr: z.string().min(1).max(160),
  type: z.enum([
    "VIDEO_UPLOAD",
    "VIDEO_EMBED",
    "PDF",
    "SLIDES",
    "DOCUMENT",
    "IMAGE",
    "TEXT",
    "AUDIO",
    "EXTERNAL_LINK",
  ]),
  contentUrl: z.string().optional().nullable(),
  bodyEn: z.string().optional().nullable(),
  bodyAr: z.string().optional().nullable(),
  durationMinutes: z.coerce.number().int().min(0).optional().default(0),
  isPreview: z.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).optional(),
});

export const attachmentSchema = z.object({
  lessonId: z.string(),
  titleEn: z.string().min(1).max(160),
  titleAr: z.string().min(1).max(160),
  url: z.string().min(1),
  fileType: z.string().optional().nullable(),
  isExternal: z.boolean().optional().default(false),
});

const questionSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE"]),
  promptEn: z.string().min(1),
  promptAr: z.string().min(1),
  options: z.array(z.object({ id: z.string(), en: z.string(), ar: z.string() })),
  correctOptionIds: z.array(z.string()).min(1),
  explanationEn: z.string().optional().nullable(),
  explanationAr: z.string().optional().nullable(),
  points: z.coerce.number().int().min(1).default(1),
});

export const quizSchema = z.object({
  courseId: z.string(),
  lessonId: z.string().optional().nullable(),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  descEn: z.string().optional().nullable(),
  descAr: z.string().optional().nullable(),
  passingScore: z.coerce.number().int().min(0).max(100).default(70),
  maxAttempts: z.coerce.number().int().min(0).default(0),
  questions: z.array(questionSchema).min(1),
});

export const quizAttemptSchema = z.object({
  answers: z.record(z.array(z.string())),
});
