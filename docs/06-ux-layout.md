# 6. UI/UX Layout Plan

## Design language
- **Premium, clean, trustworthy.** Generous spacing, soft shadows, rounded-2xl cards, restrained color.
- **Palette:** brand indigo/blue (primary), warm orange accent, neutral "ink" grays. Defined in `tailwind.config.ts`.
- **Typography:** Latin (Inter-style stack) for EN; Arabic stack (Noto Sans Arabic / Cairo / Tajawal) auto-applied under `dir="rtl"`.
- **Direction:** layout uses logical utilities (`ms-`/`me-`, `ltr:`/`rtl:`) so the same components mirror correctly in Arabic.
- **Responsive:** mobile-first; sidebars collapse to drawers; grids reflow at `sm`/`lg`.

## Key layouts
| Screen | Layout |
|---|---|
| **Homepage** | Hero (headline + dual CTAs + stats) → featured courses grid → categories grid → benefits → how-it-works (dark band) → testimonials → FAQ accordion → CTA banner → footer. |
| **Catalog** | Sticky filter bar (search, category, level) + responsive course-card grid. |
| **Course detail** | Dark header band (title, meta, badges) + two columns: content (overview, objectives, accordion curriculum, requirements) and a sticky enroll/price card. |
| **Auth** | Split screen: form on one side, brand gradient panel on the other; language switcher in header. |
| **Player** | Left (or right in RTL) curriculum sidebar with progress + checkmarks; main area = content + mark-complete + prev/next + quiz CTA + attachments + notes. Sidebar → drawer on mobile. |
| **Quiz** | Single-column question cards; radio options; submit → result banner (score, pass/fail) with per-question correctness + explanations. |
| **Certificate** | Bordered "diploma" card: platform, recipient, course, date, serial, QR; verify banner + print button. |
| **Dashboards** | Persistent sidebar nav + content; stat cards, tables, progress bars. Shared `DashboardShell` for student & admin. |
| **Course editor (admin)** | EN/AR language tabs for bilingual fields; sections for basic info, media (with upload), pricing, objectives/requirements; below it a content manager for modules → lessons → attachments → quiz builder. |

## Reusable components
`Button`/`ButtonLink`, `Card`, `Input`/`Textarea`/`Select`/`Label`, `Badge`, `ProgressBar`, `SectionHeading`, `EmptyState`, `StatCard`, `CourseCard`, `LanguageSwitcher`, `Navbar`, `Footer`, `DashboardShell`, player + admin builders.

## Interaction & feedback
- Inline success/error messages on forms; optimistic UI in the player (progress updates immediately).
- Confirm dialogs for destructive admin actions.
- Loading states on async buttons; smooth fade-in on content blocks.
