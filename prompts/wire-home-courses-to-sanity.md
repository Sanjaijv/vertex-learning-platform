# Implementation prompt: Wire home page "All Courses" to Sanity

## Goal

Replace the hardcoded sample courses in `app/page.tsx`'s "All Courses" preview grid with real data from the seeded Sanity dataset, using the same server-side, read-only data path the course page (`app/courses/[slug]/page.tsx`) already uses.

## Guidance inspected

- `AGENTS.md` sections 2, 5 (pages are read-only, server-only Sanity client), 7.
- `prompts/implement-home-page.md` — explicitly flagged the hardcoded course cards as a known gap to fix once a data layer existed ("This is not wired to Sanity because no schema/content/client exists yet ... building that is a separate, larger task").
- `prompts/implement-course-page.md` and the code it produced (`app/courses/[slug]/page.tsx`, `sanity/lib/queries.ts`, `app/lib/format.ts`) — the data layer now exists and this task reuses it.
- Live dataset: confirmed `COURSES_QUERY` currently returns 10 real courses but no module/lesson duration data, and that GROQ's `count()`/`math::sum()` can compute module count and total duration server-side without fetching full lesson arrays (tested directly against the dataset).

## Current state

- `app/page.tsx` is a Server-Component-shaped file but not marked `async`; it renders 3 hardcoded `courses` entries with hand-picked emoji/letter "tile" glyphs (`course-tile-nextjs`, `course-tile-docker`, `course-tile-typescript` in `globals.css`) that don't correspond to any real data — seeded courses have real `coverImage` photos instead.
- `sanity/lib/queries.ts`'s `COURSES_QUERY` fetches `coverImage`, `level`, `price`, `popular`, `studentCount`, `instructor`, `category` — no module count or duration.
- `sanity/lib/data.ts`'s `getCourses()` already exists and is unused by any page yet.
- `app/courses/[slug]/page.tsx` already has `LEVEL_LABEL` and imports from `app/lib/format.ts` (`formatDuration`) — duplicating `LEVEL_LABEL` a second time in `app/page.tsx` would be the second copy.

## Decisions and assumptions

- Extend `COURSES_QUERY` with two computed fields so the card grid doesn't need to fetch full lesson arrays for every course in a listing: `"moduleCount": count(modules)` and `"totalSeconds": math::sum(modules[].lessons[]->duration)` (verified this flattens and sums correctly against the live dataset). Regenerate `sanity.types.ts` via the Studio's typegen script.
- `app/page.tsx` becomes `async` and calls `getCourses()`, taking the first 3 results for the preview grid (query already orders by `_createdAt desc`; no new sort logic needed). The full "View all courses" grid is out of scope (separate catalog page, per AGENTS.md section 1).
- Replace the hand-picked glyph tiles with the course's real `coverImage`, rendered via `next/image` + the existing `urlFor()` helper (same pattern as the course page), in a small rounded square matching the tile's footprint. Remove the now-dead `.course-tile*` CSS and the local `courses` fixture array.
- Move `LEVEL_LABEL` out of `app/courses/[slug]/page.tsx` into `app/lib/level.ts` (a `formatLevel(level)` helper) and use it from both the course page and the home page, instead of duplicating the map a second time.
- Card meta row keeps the same three items (level, duration, modules) using `formatDuration(totalSeconds)` from `app/lib/format.ts` and `moduleCount` — no student count on this card, matching the existing design.
- Course card links to `/courses/[slug]` (route now exists) — currently the sample cards aren't links at all; make the whole card a `<Link>` since real navigation is now possible.
- No pagination/loading states — 3 courses, static per request, same caching (`revalidate`/tag) behavior `getCourses()` already has.

## Expected files to touch

- `sanity/lib/queries.ts`: extend `COURSES_QUERY`.
- `sanity.types.ts`: regenerated.
- `app/page.tsx`: make async, fetch real courses, drop the fixture array and glyph tiles, render `<Link>` cards with real cover images.
- `app/lib/level.ts`: new shared helper, replacing the duplicate `LEVEL_LABEL` maps.
- `app/courses/[slug]/page.tsx`: switch to the shared `formatLevel` helper.
- `app/globals.css`: remove dead `.course-tile*` rules, add a small thumbnail-image rule for the home card.

## Requirements

- Home page "All Courses" grid shows the 3 most recently created real courses with their actual title, summary, level, computed duration, and module count, each card linking to its `/courses/[slug]` page.
- No fabricated data — nothing hardcoded per-course remains in `app/page.tsx`.
- Visual layout stays the same as today (card shape, spacing, meta row) — only the tile becomes a real image and the content becomes real.

## Security considerations

- Same as the course page: all fetching stays server-side through the existing read-token client; cover images render only from `cdn.sanity.io` via the already-configured `remotePatterns`.

## Acceptance criteria

- `/` shows 3 real seeded courses (not the old Next.js/Docker/TypeScript fixture) with real cover photos, correct level/duration/module-count, each linking to a working `/courses/[slug]` page.
- `LEVEL_LABEL` exists once, shared between the two pages.
- TypeScript, ESLint, and production build checks pass.

## Checks to run

From `studio/`: `npm run typegen` (regenerate types after the query change).
From `/data/vertex`: `npx tsc --noEmit`, `npm run lint`, `npm run build`, then load `/` in the dev server and click through to a course.

## Exact manual test steps

1. Open `/`. Confirm the "All Courses" grid shows 3 real course titles/summaries (not "Next.js for Production", "Docker Essentials", "TypeScript Deep Dive") with real photo thumbnails and correct level/duration/module-count.
2. Click a card; confirm it navigates to that course's real `/courses/[slug]` page.
3. Confirm no console errors and no layout regression versus the current card design.
