# Deploying a public **preview** on Vercel

This guide spins up a temporary, publicly reachable preview of the platform for
manual review. It is **not** a hardened production setup (payments are stubbed,
email is not wired, uploads are ephemeral on serverless — see *Caveats*).

The repo is already prepared: a `vercel-build` script (which Vercel runs
automatically) generates the Prisma client, pushes the schema to your database,
seeds demo data **once** (idempotent — later deploys keep your data), then
builds the app.

---

## Step 1 — Create a Postgres database (~1 min)

You need a publicly reachable Postgres. Easiest options:

- **Vercel Postgres** (Vercel dashboard → *Storage* → *Create* → *Postgres*), or
- **Neon** (https://neon.tech, free tier) → copy the connection string.

Copy the **direct (non-pooling)** connection string, e.g.:

```
postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

> If you use Vercel Postgres, use the value it labels `POSTGRES_URL_NON_POOLING`
> as your `DATABASE_URL` (the build runs `prisma db push`, which wants a direct
> connection).

## Step 2 — Import the repo into Vercel (~1 min)

1. Vercel dashboard → **Add New… → Project**.
2. Import the GitHub repo `omarsh1125-hash/ed-plat1`.
3. Set **Production Branch** (or deploy the branch) to **`claude/vigilant-planck-mb9bba`**.
4. Framework preset: **Next.js** (auto-detected). Leave build/output settings as default —
   Vercel automatically uses the `vercel-build` script.

## Step 3 — Add Environment Variables (~2 min)

Project → **Settings → Environment Variables**. Paste these (replace
`DATABASE_URL` with yours, and set the two URL vars to your assigned Vercel
domain after the first deploy — see note):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *your Postgres connection string from Step 1* |
| `NEXTAUTH_SECRET` | `Kp7cfTCWY2aJwumxSzY3CGR1qZXZUVDBHCbvLs9EeQU=` |
| `NEXTAUTH_URL` | `https://<your-project>.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://<your-project>.vercel.app` |
| `STORAGE_DRIVER` | `local` |
| `LOCAL_UPLOAD_DIR` | `/tmp/uploads` |
| `NEXT_PUBLIC_UPLOAD_BASE_URL` | `/uploads` |
| `PAYMENTS_DRIVER` | `stub` |
| `NEXT_PUBLIC_PLATFORM_NAME` | `EduPlatform` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ar` |

> **`NEXTAUTH_URL` note:** NextAuth needs this to match the live domain or login
> callbacks fail. Easiest flow: deploy once, copy the stable
> `https://<project>.vercel.app` domain Vercel assigns, set both URL vars to it,
> then redeploy. (Per-deploy preview URLs change; use the project's stable domain.)

## Step 4 — Deploy

Click **Deploy**. The build will:
`prisma generate → prisma db push → seed (first time only) → next build`.

When it finishes, open the assigned URL. First load is **Arabic (RTL)** — toggle
**EN** at the top-right.

---

## Test accounts (seeded automatically)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@edu.test` | `admin1234` |
| Student | `student@edu.test` | `student1234` |

Suggested review path: `/` → browse **Courses** → log in as the student → enroll →
open the **player**, take the **quiz**, finish the course to auto-issue a
**certificate** (scan its QR / open the public verify page) → log in as **admin**
to see the **CMS**, users, and payments.

---

## Caveats (preview only — by design)

- **Uploads are ephemeral.** Vercel's serverless filesystem is read-only except
  `/tmp`, which is per-instance and wiped between invocations. Admin file uploads
  won't persist reliably on Vercel. The seeded demo content needs no uploads, so
  review is unaffected. For persistent media, wire the S3 driver
  (`STORAGE_DRIVER=s3`, interface already in `src/lib/storage.ts`).
- **Payments are stubbed** (`PAYMENTS_DRIVER=stub`) — "buying" a paid course
  grants access immediately; no real charge.
- **Email is not wired** — password-reset returns the token in the API response
  in non-production instead of emailing it.
- **Re-seeding:** each deploy runs the seed, but it **skips when the DB already
  has users**, so your test data survives redeploys. To force a clean reset, set
  `SEED_FORCE=1` in the env (or run `npm run db:reset` against the DB) and redeploy.

## Alternative: deploy from your own machine via CLI

```bash
npm i -g vercel
vercel link            # pick/create the project
# add the env vars from Step 3 in the dashboard, then:
vercel --prod=false    # creates a preview deployment and prints the URL
```
