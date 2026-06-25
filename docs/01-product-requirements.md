# 1. Product Requirements Document (PRD)

## 1.1 Vision
A modern, premium, bilingual (Arabic/English) educational platform where learners browse courses, enroll, watch lessons, track progress, take quizzes, and earn verifiable certificates — while administrators manage all content and users without touching code. The Arabic experience is native (RTL), not a translation afterthought.

## 1.2 Goals
- Deliver a fast, clean, trustworthy learning experience on desktop, tablet, and mobile.
- Full parity between Arabic and English across every screen, message, and form.
- Let admins create/organize/publish content (uploaded or externally embedded) entirely from the dashboard.
- Be production-shaped and extensible: payments, cloud storage, and email can be added without rearchitecting.

## 1.3 Non-goals (v1)
- Live/synchronous classes, real-time chat, discussion forums.
- Mobile native apps (the web app is fully responsive).
- Multi-tenant / multi-org separation.

## 1.4 Personas
- **Guest** — evaluating the platform; browses catalog and course details, switches language, registers.
- **Student** — enrolls, learns, tracks progress, takes quizzes, earns certificates, manages profile/preferences.
- **Admin** — manages users, courses, content, quizzes, certificates, payments, and platform/language settings.

## 1.5 Functional requirements
| Area | Requirements |
|------|--------------|
| Localization | EN/AR everywhere; auto RTL/LTR; instant switcher; locale persisted (cookie + user preference). |
| Auth | Register, login, logout, forgot/reset password; RBAC (STUDENT/ADMIN); protected routes. |
| Catalog | Categories, levels, search/filter, free/paid, featured; SEO-friendly detail pages. |
| Enrollment | Free enroll & paid checkout (stub → access); order history; access control. |
| Learning | Player with curriculum sidebar, content area, mark-complete, prev/next, progress %, notes, attachments, embedded quiz; resume from last lesson. |
| Content types | Uploaded/embedded video, PDF, slides, docs, images, text, audio, links, downloads. |
| Quizzes | MCQ & true/false, correct answers, explanations, passing score, attempts, results. |
| Certificates | Auto-issue on completion; student name, course, date, serial, QR verification. |
| Student dashboard | My courses, progress, continue, completed, certificates, profile, settings, language. |
| Admin dashboard | Analytics; course/user/content/quiz/certificate/payment management; settings; language management. |

## 1.6 Non-functional requirements
- **Performance:** RSC + static where possible; first-load JS ~87 kB shared.
- **Security:** bcrypt hashing, Zod validation, server-side quiz grading, RBAC, MIME/size-limited uploads.
- **Maintainability:** clean folder structure, reusable components, typed end-to-end, single storage/payment interfaces.
- **Accessibility/UX:** semantic markup, keyboard-friendly controls, comfortable spacing, responsive at all breakpoints.

## 1.7 Success metrics (suggested)
Enrollment conversion, course completion rate, quiz pass rate, certificates issued, returning learners, time-to-publish for admins.
