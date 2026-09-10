# Implementation prompt: All Courses page

## Goal

Build the read-only All Courses page at `/courses`, using the existing Sanity course data and the visual language already established by the home page and course detail page.

## Guidance inspected

- `AGENTS.md`, especially the workflow, page/data boundaries, and responsive UI requirements.
- Existing `app/page.tsx`, `app/courses/[slug]/page.tsx`, `app/components/SiteHeader.tsx`, `app/components/ui.tsx`, and `app/globals.css`.
- Existing `sanity/lib/data.ts` and `sanity/lib/queries.ts`.

## Decisions and assumptions

- Keep the page a Server Component and fetch courses through the existing server-only `getCourses()` helper.
- Render every returned course in a responsive grid. Do not add client-side filtering, sorting, pagination, or search; the request is for a simple catalog.
- Each card links to `/courses/{slug}` and reuses the current course metadata patterns: cover image, optional popular badge, title, summary, level, duration, and module count.
- Use `next/image` with `urlFor()` when a cover image exists and preserve a stable visual fallback when it does not.
- Add only page-specific styles needed for the catalog and keep the existing home/course styles intact.

## Expected files to touch

- `app/courses/page.tsx`: new catalog page.
- `app/globals.css`: catalog layout, heading, card, and responsive styles.

## Requirements

- Include `SiteHeader`.
- Provide a clear page heading, a short supporting line, and the total course count.
- Render all courses from Sanity in a desktop multi-column grid that collapses cleanly on smaller screens.
- Keep course cards keyboard-accessible links with readable image alt text and no broken image layout.
- Show an empty state when no courses are returned.
- Use existing typography, colors, radii, buttons, badges, metadata icons, formatters, and image helpers.
- Add page metadata with an appropriate title and description.
- Keep all content fetching server-side and make no mutations.

## Acceptance criteria

- `/courses` loads real course records from Sanity and links each card to its detail page.
- The page remains usable at desktop, tablet, and 320px mobile widths without horizontal overflow.
- Missing cover images do not cause layout shifts or runtime errors.
- TypeScript, lint, and production build pass.

## Checks to run

From `/data/vertex`:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. Start `npm run dev` and inspect `/courses` at desktop and narrow mobile widths.

## Manual test steps

1. Open `/courses` and confirm the header, heading, count, and all seeded course cards render.
2. Open a card and confirm it navigates to the matching `/courses/{slug}` page.
3. Resize to 768px, 390px, and 320px and confirm cards stack or reflow without clipped text or page overflow.
4. Confirm the browser console has no errors or hydration warnings.