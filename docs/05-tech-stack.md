# 5. Recommended Tech Stack

| Concern | Technology | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Server Components for fast, SEO-friendly pages; API routes for the backend; one codebase for FE + BE. |
| Language | **TypeScript** (strict) | End-to-end type safety from DB to UI. |
| Styling | **Tailwind CSS** | Rapid, consistent, RTL-aware utility styling; custom premium theme. |
| Database | **PostgreSQL** | Relational integrity fits courses → modules → lessons → progress and analytics. |
| ORM | **Prisma** | Typed queries, migrations, great DX; easy to point at managed Postgres. |
| Auth | **NextAuth (Auth.js)** + **bcrypt** | Battle-tested sessions (JWT), credentials provider, extensible to OAuth. |
| Validation | **Zod** | Runtime validation shared by API routes and forms. |
| Icons | **lucide-react** | Clean, consistent icon set. |
| Certificates | **qrcode** | Server-side QR generation for verification. |
| Storage | **Pluggable adapter** (local now, S3-ready) | No vendor lock-in; swap drivers via env. |
| Payments | **Pluggable adapter** (stub now, Stripe-ready) | Paid-course flow works today; real gateway plugs in later. |

## Architecture principles
- **Server-first**: data fetching in RSC; client components only where interactivity is needed (player, forms, builders).
- **Single interfaces** for cross-cutting infra (`Storage`, `PaymentProvider`) so implementations swap without touching call sites.
- **Locale as a route segment** (`/[locale]`) with a dictionary-based i18n layer and middleware-driven redirects.
- **Thin API + shared libs** (`src/lib`) for auth, RBAC, queries, progress, validators.

## Deployment notes
- Works on any Node host (Vercel, Render, Fly, Docker). Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`.
- For uploads in production, switch `STORAGE_DRIVER=s3` (or mount a persistent volume for local).
- Run `prisma migrate deploy` (or `prisma db push`) on release.
