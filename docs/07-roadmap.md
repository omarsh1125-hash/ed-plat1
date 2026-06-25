# 7. Development Roadmap

## ✅ Phase 0 — Foundation (done)
Project config, Tailwind theme, Prisma schema + PostgreSQL, i18n (EN/AR dictionaries), middleware (locale + route protection), core libs (auth, RBAC, storage, payments, queries, validators).

## ✅ Phase 1 — Core platform (done, this build)
- Auth: register, login, forgot/reset password, RBAC.
- Public: homepage, catalog with filters, course detail, static pages.
- Student: dashboard, course player (notes, attachments, progress, mark-complete, resume), quizzes, certificates.
- Admin: analytics, course CMS (modules/lessons/attachments/quiz builder), uploads, user management, certificates, orders, settings.
- Bilingual + RTL across all of the above; payment stub + storage abstraction; sample seed data.

## 🔜 Phase 2 — Productionizing
- **Stripe** payments (real checkout + webhooks, refunds) via the existing `PaymentProvider` interface.
- **S3-compatible storage** implementation + signed URLs for private media.
- **Email** (password reset, enrollment receipts, certificate delivery) via a provider.
- **Prisma migrations** workflow (replace `db push`) and seed environments.
- Image optimization for uploaded media; video transcoding/streaming option.

## 🔮 Phase 3 — Engagement & scale
- Reviews & ratings; instructor profiles & multi-instructor roles.
- Discussion/Q&A per lesson; announcements.
- Coupons/discounts, bundles, subscriptions.
- Richer analytics (cohorts, funnels, per-lesson drop-off); CSV export.
- Drag-and-drop reordering of modules/lessons; bulk import.
- Additional locales (the i18n layer is locale-agnostic).
- OAuth providers; 2FA; audit logs.

## 🧪 Cross-cutting / quality
- Automated tests (unit for libs, integration for APIs, e2e for key flows).
- Accessibility audit (WCAG AA) and performance budgets.
- Rate limiting on auth/upload endpoints; CSP & security headers.
- CI/CD pipeline with typecheck + build + migration gate.
