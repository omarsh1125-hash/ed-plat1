# 3. User Roles & Permissions

Two roles are modeled via the `Role` enum (`STUDENT`, `ADMIN`). Guests are unauthenticated visitors.

## Permission matrix

| Capability | Guest | Student | Admin |
|---|:---:|:---:|:---:|
| Browse homepage / catalog / course details | ✅ | ✅ | ✅ |
| Switch language (EN/AR) | ✅ | ✅ | ✅ |
| Register / log in | ✅ | — | — |
| Preview lessons marked *preview* | ✅ | ✅ | ✅ |
| Enroll in free courses | — | ✅ | ✅ |
| Purchase paid courses (checkout) | — | ✅ | ✅ |
| Access enrolled course content / player | — | ✅ (if enrolled) | ✅ (if enrolled) |
| Mark lessons complete / track progress | — | ✅ | ✅ |
| Write personal notes | — | ✅ | ✅ |
| Take quizzes / view results | — | ✅ (if enrolled) | ✅ |
| Receive & view certificates | — | ✅ | ✅ |
| Verify a certificate by serial | ✅ | ✅ | ✅ |
| Manage own profile / password / language | — | ✅ | ✅ |
| Create / edit / publish / delete courses | — | — | ✅ |
| Manage modules / lessons / attachments / quizzes | — | — | ✅ |
| Upload / embed content | — | — | ✅ |
| Manage users (role, activate/deactivate) | — | — | ✅ |
| View analytics, orders, certificates | — | — | ✅ |
| Manage platform & language settings | — | — | ✅ |

## Enforcement layers
1. **Middleware** (`src/middleware.ts`) — redirects unauthenticated users away from `/dashboard`, `/learn`, `/admin`; redirects non-admins away from `/admin`.
2. **Server components / layouts** — `getCurrentSession`, `requireUser`, `requireRole`, and `redirect` re-check on render.
3. **API routes** — `requireUser` / `assertAdmin` throw `UNAUTHENTICATED` / `FORBIDDEN`, mapped to 401/403.
4. **Data-level** — enrollment checks gate content/quiz access; admins cannot demote/deactivate themselves.
