# Implementation prompt: Course detail page

## Goal

Build the real course detail page at `/courses/[slug]`, reproducing `design/vertex-course.png`, wired to the seeded Sanity content (server-side, read-only): breadcrumb, cover image, popular badge, title/summary, meta row (level, duration, module count, student count), a "What you'll learn" outcomes grid, and an expandable "Course Content" module list. Fix two schema/query bugs discovered while wiring real data so the page actually has data to render.

## Guidance inspected

- `AGENTS.md` sections 2 (workflow), 3 (UI fidelity + responsiveness), 5 (pages are read-only; server-only Sanity client), 6/7 (stack and standing decisions — progress tracking is a separate, not-yet-built feature), 8 (course/module/lesson data shape), 14.
- `sanity-best-practices` skill for GROQ projections, image handling, and TypeGen workflow.
- `design/vertex-course.png` (source of truth) and `design/vertex-home.png`/the already-built `SiteHeader` for the shared header pattern.
- Existing code: `sanity/lib/queries.ts`, `sanity/lib/data.ts`, `sanity/lib/fetch.ts`, `sanity/lib/client.ts`, `sanity/lib/image.ts`, `sanity.types.ts`, `studio/schemaTypes/**`, `app/components/{ui.tsx,SiteHeader.tsx}`, `app/globals.css`, `app/page.tsx`.
- Live dataset, queried directly with the existing read-token client to see what's actually seeded (10 courses, e.g. `course.nextjs-app-router-in-depth`, 4 modules each).

## Current state

- The Sanity content model, `next-sanity` client, and `sanity/lib` fetch helpers already exist and are wired to a private dataset with real seeded content (`studio/scripts/seed/seed.ndjson`, already imported — confirmed by querying the live dataset).
- **Two real mismatches between the Studio schema/query layer and the actually-seeded data**, found by querying the live dataset directly:
  1. Course outcomes: `course.ts` and `COURSE_BY_SLUG_QUERY` use the field name `outcomes` / object type `outcome`, but every seeded course document stores this array under the key `learningOutcomes` with items typed `_type: "learningOutcome"`. The query currently returns `outcomes: null` for every course.
  2. Lesson duration: `lesson.ts` declares `duration` as a display `string` (e.g. `"12:34"`), but every seeded lesson stores `duration` as a **number of seconds** (e.g. `350`). TypeGen currently types it as `string | null`, which doesn't match reality.
- No `/courses` catalog route and no `/lessons/[slug]` route exist yet — both are separate, later pieces of work. This page links to them anyway (same precedent as the home page linking to routes that don't exist yet).
- No progress-tracking schema or server route exists yet (confirmed: no "progress" anywhere in `app/` or `studio/schemaTypes/`). Per the user's decision below, this page ships without any progress UI.
- `next.config.ts` has no `images.remotePatterns` configured yet — nothing in the app currently renders a Sanity image.
- `SiteHeader`, `VertexLogo`, `Badge`, `MetaIcon` already exist in `app/components/` and are reused as-is.

## Decisions and assumptions

- **Fix the two schema mismatches at the source** rather than papering over them in the query:
  - Rename the object schema `studio/schemaTypes/objects/outcome.ts` → `learningOutcome.ts` (type name `outcome` → `learningOutcome`, same fields), and update `course.ts`'s field from `outcomes` (array of `outcome`) to `learningOutcomes` (array of `learningOutcome`). Register the renamed type in `studio/schemaTypes/index.ts`.
  - Change `lesson.ts`'s `duration` field from `type: 'string'` to `type: 'number'` (seconds), updating its description accordingly.
  - Update `sanity/lib/queries.ts` (`COURSE_BY_SLUG_QUERY`, `COURSES_QUERY` if relevant, `LESSON_BY_SLUG_QUERY`) to match the new field names/types.
  - Regenerate `sanity.types.ts` via the Studio's typegen script so generated types match.
  - This is a small, necessary correctness fix (the alternative — building the course page against a query that always returns `outcomes: null` and a `duration` typed as `string` when it's actually seconds — would mean the page can't be wired to seeded content as asked). No seed data or Studio deploy changes are needed since the dataset already matches the corrected shape.
- **No progress UI in this task** (per explicit user decision): the hero shows a plain "Start Course" primary button (arrow icon, links to the first lesson in module order) and a "Bookmark" secondary button (presentational only, local toggle state, no persistence — same category as the notifications bell). The sticky bottom progress bar from the design is **not built**; it ships later alongside the progress-tracking feature.
- Course duration and module durations aren't stored fields — derive them by summing lesson `duration` (seconds) client-side (in the page/server component, plain arithmetic, no new query complexity) and formatting with a small helper.
- Add `app/lib/format.ts` with `formatDuration(totalSeconds): string` (e.g. `750` → `"12m"`, `4520` → `"1h 15m"`) and `formatStudentCount(n): string` (e.g. `2140` → `"2.1k"`, `800` → `"800"`), reused for both the course-level and per-module numbers.
- Add `app/lib/outcome-icons.ts` mapping the 8 known seeded icon strings (`layers`, `workflow`, `gauge`, `rocket`, `code`, `puzzle`, `shield`, `sparkles`) to their `lucide-react` components, with a safe fallback icon (`Sparkles`) for any unrecognized value — outcomes are author-entered strings, so don't let an unknown value crash the page.
- "Course Content" is a numbered list of **modules** (not individual lessons) — each row shows its number, title, summary, total duration, and a chevron that expands to show that module's lessons (title, duration, and a lock icon for lessons that aren't `freePreview`, linking to `/lessons/[slug]`). This needs client-side expand/collapse state, so it's a small Client Component (`app/components/CourseContent.tsx`) that receives the already-fetched, plain-data module list as props — data fetching itself stays server-side in the page.
- Matching the design, only the first 6 modules show initially with a "Show all N modules" toggle beneath; if a course has 6 or fewer modules, no toggle renders. Real seeded courses currently have 4 modules each, so the toggle won't visibly trigger against seed data, but the code must handle courses with more than 6 generically.
- Configure `next.config.ts` `images.remotePatterns` for `cdn.sanity.io` and use `next/image` with the existing `urlFor()` helper for the cover image (and lesson posters, if shown in an expanded module row's thumbnail — design doesn't show per-lesson thumbnails here, so skip that; only the top hero cover image is an actual image).
- Breadcrumb ("All Courses > {Course Title}") links "All Courses" to `/courses` (not yet built, same precedent as other not-yet-built routes).
- "POPULAR" badge renders only when `course.popular` is true (reuses the existing `Badge` component/`.badge-popular` class from the design system).
- Page is a Server Component (`app/courses/[slug]/page.tsx`) that calls `getCourseBySlug`, calls `notFound()` if no course matches, and passes derived/plain data down to the small client accordion. Add `generateStaticParams` from `getCourseSlugs()` (existing helper) so course pages are statically known, consistent with "pages are read only."

## Expected files to touch

- `studio/schemaTypes/objects/outcome.ts` → renamed to `studio/schemaTypes/objects/learningOutcome.ts`.
- `studio/schemaTypes/documents/course.ts`: field rename `outcomes` → `learningOutcomes`, array member type update.
- `studio/schemaTypes/documents/lesson.ts`: `duration` field type `string` → `number`.
- `studio/schemaTypes/index.ts`: update the renamed import/registration.
- `sanity/lib/queries.ts`: update `COURSE_BY_SLUG_QUERY` (and any other query touching these fields) to the corrected field names.
- `sanity.types.ts`: regenerated via `npm run typegen` in `studio/` (generated file, not hand-edited).
- `app/courses/[slug]/page.tsx`: new course detail page.
- `app/components/CourseContent.tsx`: new client component for the modules accordion.
- `app/components/Bookmark.tsx`: new small client component for the presentational bookmark toggle (or folded into `ui.tsx` if trivial enough — implementer's call).
- `app/lib/format.ts`: new formatting helpers.
- `app/lib/outcome-icons.ts`: new icon-name → component map.
- `app/globals.css`: add course-page styles (breadcrumb, hero, outcomes grid, course-content list/accordion).
- `next.config.ts`: add `images.remotePatterns` for `cdn.sanity.io`.

## Requirements

### Breadcrumb

- "All Courses" (link to `/courses`) `>` current course title, small muted text, matching spacing in the reference.

### Hero

- Cover image (rounded corners, `next/image`) on the left; on the right: "POPULAR" badge (conditional), large Playfair Display title, summary paragraph, a meta row with level/duration/module-count/student-count (icon + label each, reusing `MetaIcon`), and a button row with "Start Course" (primary, arrow icon, links to the first lesson by module/lesson order) and "Bookmark" (secondary/tertiary style, bookmark icon, local toggle only).

### What you'll learn

- Panel titled "What you'll learn", a 2-column grid of outcome cards (icon in a rounded swatch, title, description), built from `course.learningOutcomes`.

### Course Content

- Panel header: "Course Content" title, right-aligned "`{modules.length} modules • {formatted total duration}`".
- Numbered rows (1, 2, 3…) each with title, summary, total module duration, and a chevron toggle; expanding a row reveals its lessons (title, duration, lock/play indicator) linking to `/lessons/[slug]`.
- "Show all N modules" control beneath the list when there are more than 6 modules; collapses back to "Show less" (or similar) when expanded.

### Responsive behavior

- Hero switches from a 2-column (image | text) layout to stacked on narrow widths, cover image full-width above the text.
- Outcomes grid collapses from 2 columns to 1 column on narrow widths.
- Course content rows remain legible and don't overflow horizontally at 320px.

### Accessibility and quality

- Single `h1` for the course title; section headings ("What you'll learn", "Course Content") as `h2`.
- Chevron/expand controls are real `<button>`s with `aria-expanded` and an accessible name; "Show all" control likewise.
- Bookmark button has an accessible name reflecting its toggled state (e.g. "Bookmark this course" / "Remove bookmark").
- Visible keyboard focus preserved; respects `prefers-reduced-motion`.
- `notFound()` renders Next's standard 404 for an unknown slug instead of crashing.

## Security considerations

- Read-only page: no client-side writes, no user input submitted anywhere.
- Cover image comes only from the Sanity CDN via `urlFor()`/`next/image` with a scoped `remotePatterns` entry — no arbitrary remote image rendering.
- All content fetching happens server-side through the existing private-dataset, read-token client (`sanity/lib/client.ts`); the browser never sees the token.
- Bookmark toggle is local UI state only — no fetch, no write, nothing to secure.

## Acceptance criteria

- `/courses/nextjs-app-router-in-depth` (and the other 9 seeded course slugs) render real Sanity content matching `design/vertex-course.png`'s layout at desktop width, including a populated "What you'll learn" section (proves the `learningOutcomes` fix works) and correct module/lesson durations (proves the `duration` fix works).
- An unknown slug (`/courses/does-not-exist`) renders Next's 404 page.
- No progress bar or "Continue Learning" state anywhere on the page; "Start Course" and "Bookmark" are the only hero actions.
- Course Content accordion expands/collapses per module and shows real lesson titles/durations.
- TypeScript, ESLint, and production build checks pass; `sanity.types.ts` reflects the schema changes with no leftover `outcome`/string-duration types.

## Checks to run

From `studio/`:

1. `npm run typegen` (regenerates `sanity.types.ts` from the corrected schema + queries).

From `/data/vertex`:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. Start `npm run dev`, load `/courses/nextjs-app-router-in-depth` and at least one other seeded slug, confirm no runtime errors.
5. Compare against `design/vertex-course.png` at 1024px, then check 768px, 390px, and 320px.

## Exact manual test steps

1. Open `/courses/nextjs-app-router-in-depth`. Verify breadcrumb, cover image, POPULAR badge, title, summary, meta row (level/duration/modules/students), and the "Start Course" + "Bookmark" buttons.
2. Verify "What you'll learn" shows 4 real outcome cards with correct icons/titles/descriptions (not empty — this is the regression test for the `learningOutcomes` fix).
3. Verify "Course Content" shows 4 modules with correct titles, summaries, and durations that look like real sums of seconds (not `"undefined"` or raw seconds) — this is the regression test for the `duration` fix.
4. Click a module's chevron; confirm it expands to show that module's lessons with correct titles/durations and a lock icon on non-free lessons.
5. Click "Start Course"; confirm it links to `/lessons/{first-lesson-slug}` (the route need not exist yet — a 404 there is expected and fine).
6. Click "Bookmark"; confirm it visibly toggles state and its accessible name updates.
7. Visit `/courses/does-not-exist` and confirm Next's 404 page renders.
8. Resize to 768px, 390px, 320px; confirm no horizontal overflow and the hero/outcomes grid reflow sensibly.
9. Confirm no console errors/hydration warnings.
