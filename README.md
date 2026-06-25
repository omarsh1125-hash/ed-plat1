# EduPlatform — Bilingual (Arabic / English) Learning Platform

A modern, full-stack educational platform built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma + PostgreSQL**, **Tailwind CSS**, and **NextAuth**. It is fully bilingual — every page, button, form, and message works natively in **Arabic (RTL)** and **English (LTR)** — and ships with course browsing, enrollment, a lesson player, progress tracking, quizzes, auto-generated certificates, a student dashboard, and a complete admin CMS.

> The content in the seed is **sample data for testing only**. Replace it with your own from the Admin dashboard, or by editing `prisma/seed.ts`.

---

## ✨ Features

- **Bilingual & RTL-first** — locale-prefixed routes (`/en`, `/ar`), automatic `dir` switching, paired EN/AR fields on all content, instant language switcher.
- **Auth & RBAC** — email/password login, registration, forgot/reset password, JWT sessions, `STUDENT` / `ADMIN` roles, protected routes via middleware.
- **Course catalog** — categories, levels, search & filters, free/paid, course detail with curriculum, objectives, requirements.
- **Learning experience** — clean player with curriculum sidebar, mark-complete, prev/next, live progress %, per-lesson notes, attachments, embedded quiz.
- **Content types** — uploaded video, embedded video (YouTube/Vimeo auto-embed), PDF, slides, documents, images, rich text, audio, external links, downloadable resources.
- **Quizzes** — multiple-choice & true/false, server-side grading, passing score, attempt tracking, explanations, results page.
- **Certificates** — auto-issued on 100% completion, public verification page with QR code and unique serial.
- **Student dashboard** — my courses, progress, continue-learning, completed, certificates, profile & settings, language preference.
- **Admin dashboard / CMS** — analytics overview, course management (create/edit/publish/delete), drag-free module/lesson/attachment/quiz builder, file uploads, user management, certificates, payments (orders), platform & language settings — **all without editing code**.
- **Payments** — design-ready (orders, access control, free/paid). Ships with a **stub** provider that grants access immediately; **Stripe adapter** is stubbed and pluggable.
- **Storage** — pluggable abstraction; **local** disk by default, **S3-compatible** adapter ready to wire.

---

## 🧱 Tech stack

| Layer       | Choice                                             |
|-------------|----------------------------------------------------|
| Framework   | Next.js 14 (App Router, RSC) + TypeScript          |
| Styling     | Tailwind CSS (custom premium theme, RTL-aware)     |
| Database    | PostgreSQL via Prisma ORM                          |
| Auth        | NextAuth (Credentials, JWT) + bcrypt               |
| Validation  | Zod                                                |
| Icons       | lucide-react                                       |
| QR codes    | qrcode                                             |

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+ (tested on 22)
- PostgreSQL 14+

### 1. Install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and NEXTAUTH_SECRET
```
Generate a secret: `openssl rand -base64 32`

### 3. Set up the database
```bash
npm run prisma:push     # create tables from the schema
npm run db:seed         # load sample bilingual content
```

### 4. Run
```bash
npm run dev             # http://localhost:3000
```

### Demo accounts
| Role    | Email              | Password      |
|---------|--------------------|---------------|
| Admin   | `admin@edu.test`   | `admin1234`   |
| Student | `student@edu.test` | `student1234` |

---

## 📜 Scripts

| Script                 | Description                                  |
|------------------------|----------------------------------------------|
| `npm run dev`          | Start dev server                             |
| `npm run build`        | Generate Prisma client + production build    |
| `npm start`            | Start production server                      |
| `npm run typecheck`    | TypeScript check (no emit)                   |
| `npm run prisma:push`  | Sync schema to the database                  |
| `npm run db:seed`      | Seed sample data                             |
| `npm run db:reset`     | Force-reset DB and re-seed                   |
| `npm run prisma:studio`| Open Prisma Studio                           |

---

## 🗂️ Project structure

```
prisma/
  schema.prisma          # full bilingual data model
  seed.ts                # sample courses/users/quizzes
src/
  middleware.ts          # locale routing + route protection
  i18n/                  # config + en.json / ar.json dictionaries
  lib/                   # prisma, auth, session, rbac, storage, payments,
                         # progress, queries, validators, utils
  components/            # ui/, layout/, player/, admin/ + shared
  app/
    [locale]/
      (site)/            # public pages (home, courses, course, static)
      (auth)/            # login, register, forgot/reset password
      dashboard/         # student area
      admin/             # admin CMS
      learn/[slug]/      # course player
      quiz/[id]/         # quiz runner
      certificate/[serial]/  # public certificate + verification
    api/                 # REST endpoints (auth, courses, lessons, quizzes,
                         # profile, admin/*)
```

See [`docs/`](./docs) for the full Product Requirements, sitemap, roles & permissions, database schema, UX plan, and roadmap.

---

## 🔄 Swapping in real services

- **Cloud storage:** implement `S3Storage` in `src/lib/storage.ts`, add `@aws-sdk/client-s3`, set `STORAGE_DRIVER=s3` + `S3_*` env vars. No call sites change.
- **Stripe payments:** implement `StripePayments.createCheckout` + a webhook in `src/lib/payments.ts`, set `PAYMENTS_DRIVER=stripe` + keys. The `Order` model + access control already support it.
- **Email (password reset):** the forgot-password endpoint creates a hashed token; wire your email provider where the `TODO` is in `src/app/api/auth/forgot-password/route.ts` (the dev response returns the link for local testing).

---

## 🔐 Security notes

- Passwords hashed with bcrypt (cost 12); never stored or returned in plaintext.
- All inputs validated with Zod; admin APIs guarded by `assertAdmin`.
- Quiz grading is server-side only — correct answers are never sent to the client before submission.
- Course content access requires enrollment; middleware protects `/dashboard`, `/learn`, and `/admin`.
- Uploads are MIME-allow-listed and size-capped.
