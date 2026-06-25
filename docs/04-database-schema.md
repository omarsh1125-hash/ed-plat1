# 4. Database Schema

PostgreSQL via Prisma. Full source: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Bilingual strategy
Learner-facing content carries **paired `*En` / `*Ar` columns** (e.g. `titleEn` / `titleAr`). One row per entity keeps admin editing simple (English/Arabic tabs in one form) and lets the UI pick the field for the active locale via the `localized()` helper. Flexible/array-shaped content (objectives, requirements, quiz options, settings) uses `Json`.

## Entities (overview)

| Model | Purpose | Key fields / relations |
|---|---|---|
| **User** | Accounts | `role` (STUDENT/ADMIN), `passwordHash`, `locale`, `active`; → enrollments, progress, attempts, certificates, notes, orders, authored courses |
| **PasswordResetToken** | Password reset | `tokenHash` (sha256), `expiresAt`, `usedAt` → User |
| **Category** | Catalog grouping | `slug`, `nameEn/Ar`, `icon`, `order` → courses |
| **Course** | A course | `slug`, `titleEn/Ar`, `descriptionEn/Ar`, `level`, `status`, `isFree`, `price` (minor units), `currency`, `objectives`/`requirements` (Json), `featured` → category, author, modules, enrollments, quizzes, certificates, orders |
| **Module** | Section of a course | `titleEn/Ar`, `order` → course, lessons |
| **Lesson** | A unit of content | `type` (LessonType), `contentUrl`, `bodyEn/Ar`, `durationMinutes`, `isPreview`, `order` → module, attachments, quiz, progress, notes |
| **Attachment** | Downloadable/linked resource | `titleEn/Ar`, `url`, `fileType`, `isExternal` → lesson |
| **Enrollment** | Student ↔ course | unique `(userId, courseId)`, `status`, `progress` (0–100), `lastLessonId`, `completedAt` |
| **LessonProgress** | Per-lesson completion | unique `(userId, lessonId)`, `completed`, `completedAt` |
| **Note** | Personal lesson notes | `body` → user, lesson |
| **Quiz** | Assessment | `passingScore`, `maxAttempts`, optional unique `lessonId` → course, questions, attempts |
| **Question** | Quiz item | `type` (MCQ/TF), `promptEn/Ar`, `options` (Json), `correctOptionIds` (Json), `explanationEn/Ar`, `points`, `order` |
| **QuizAttempt** | A submission | `score`, `passed`, `answers` (Json) → user, quiz |
| **Certificate** | Completion award | unique `(userId, courseId)`, `serial` (verifiable), snapshot `studentName`/`courseTitleEn/Ar`, `issuedAt` |
| **Order** | Payment/access record | `amount`, `currency`, `status` (PENDING/PAID/FAILED/REFUNDED/FREE), `provider`, `providerRef` |
| **UploadedFile** | Media registry | `key`, `url`, `mimeType`, `sizeBytes`, `driver` |
| **Setting** | Admin key/value config | `key`, `value` (Json) |

## Enums
`Role`, `Locale`, `CourseLevel` (BEGINNER/INTERMEDIATE/ADVANCED), `CourseStatus` (DRAFT/PUBLISHED/ARCHIVED), `LessonType` (VIDEO_UPLOAD, VIDEO_EMBED, PDF, SLIDES, DOCUMENT, IMAGE, TEXT, AUDIO, EXTERNAL_LINK), `QuestionType` (MULTIPLE_CHOICE, TRUE_FALSE), `EnrollmentStatus`, `OrderStatus`.

## Relationship diagram (text)
```
User 1─* Enrollment *─1 Course 1─* Module 1─* Lesson 1─* Attachment
User 1─* LessonProgress *─1 Lesson
Course 1─* Quiz 1─* Question ; Quiz 1─* QuizAttempt *─1 User ; Quiz 1─0..1 Lesson
User 1─* Certificate *─1 Course ; User 1─* Order *─1 Course
Category 1─* Course ; User(author) 1─* Course
```

## Integrity & indexing highlights
- Cascading deletes from Course → Modules → Lessons → Attachments/Progress/Quiz.
- Unique constraints prevent duplicate enrollments, per-lesson progress rows, and duplicate certificates.
- Certificates snapshot title/name so they stay valid even if the source course changes.
- Prices stored in **minor units** (e.g. cents) to avoid float rounding.
- Indexes on `Course.status/category/featured`, `Enrollment.courseId`, `User.role`, etc.
