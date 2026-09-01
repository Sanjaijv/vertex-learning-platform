# Implementation prompt: Vertex home page

## Goal

Build the real Vertex home page (`/`) reproducing `design/vertex-home.png`: site header, search hero with headline/subhead/CTA/search bar, an "All Courses" preview grid of course cards, and a closing banner strip with a decorative bar-chart graphic. Move the existing design-system showcase off of `/` so it stops being the site root, and factor its shared pieces (logo, badges, meta icon) into components the home page and future pages can reuse.

## Guidance inspected

- `AGENTS.md`, particularly sections 2 (workflow), 3 (UI fidelity + responsiveness), 5 (page/route boundaries — pages are read only, data access is server-side), 7 (decisions already made), and 14.
- `design/vertex-home.png` (source of truth for this page) and `design/vertex-course.png` (confirms the shared header/nav pattern: logo, Courses, My Learning, bell, avatar — reused verbatim here).
- `design/vertex-designsystem.png` (already implemented) for the token values this page must reuse.
- Existing `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, and `prompts/implement-vertex-design-system.md` to see what tokens/classes/components already exist (colors, radii, shadows, button/card/badge classes, `VertexLogo`, `Badge`, `MetaIcon`, fonts already wired via `next/font`).
- `package.json` — `lucide-react` is already installed; no new dependencies expected.

## Current state

- `app/page.tsx` currently renders the design-system specimen sheet at `/`, not a real home page.
- Vertex tokens, fonts, and several primitives (`.btn-*`, `.badge-*`, `.panel`, shadows, radii, `VertexLogo`, `Badge`, `MetaIcon`) already exist but live inline inside `app/page.tsx` / `app/globals.css`, scoped to the design-system page's own layout classes.
- There is no Sanity content yet (no Studio workspace, no server data client). Course/catalog data does not exist as real content.
- There is no shared site header/nav component yet — the design-system page has a `.main-nav` specimen, not a real usable header.
- No Clerk integration yet, so there is no real session/avatar to render.

## Decisions and assumptions

- Move the current design-system sheet from `/` to `/design-system` (new route `app/design-system/page.tsx`), so the showcase stays available for reference without occupying the site root. Its heading/metadata stay as-is.
- Extract `VertexLogo`, `Badge`, and `MetaIcon` out of the page file into a shared `app/components/ui.tsx` module and import them from both `app/design-system/page.tsx` and the new `app/page.tsx`, instead of duplicating them.
- Add a small reusable `app/components/SiteHeader.tsx` (Courses / My Learning links, bell icon, avatar) matching the header shown in `vertex-home.png` and `vertex-course.png`. Since Clerk auth isn't wired yet, render the avatar as a static placeholder image-less circle (initials or a plain user icon) rather than inventing a fake logged-in identity; "Courses" and "My Learning" are real `<Link>`s to `/courses` and `/my-learning` even though those routes don't exist yet (out of scope to build — matches "pages are read only" scoping, no new routes beyond home).
- The search input on the home page is presentational only for this task: it is a real `<input>` with a `⌘K` hint matching the design, but it does not call the search API yet (search route/agent is a separate, later piece of work per AGENTS.md section 11). No client JS/state beyond a controlled input; pressing enter or clicking does nothing yet. This avoids overbuilding beyond what was asked.
- "Explore Courses" CTA links to `/courses` (not yet built) as a plain link; "View all courses" link does the same.
- Course cards on this page use representative sample data matching the image exactly (Next.js for Production, Docker Essentials, TypeScript Deep Dive, with their level/duration/module counts) as local fixture data in the page file, the same pattern already used for design-system specimen data. This is not wired to Sanity because no schema/content/client exists yet in this repo — building that is a separate, larger task (schema + GROQ + server fetch) that AGENTS.md's workflow requires its own prompt for. Flag this clearly in acceptance criteria and the final report.
- Reuse existing `.btn-primary`, `.badge` family, card shadow/radius tokens, and `Playfair Display`/`Inter` fonts; add new page-scoped classes in `globals.css` for the hero, search bar, course grid, and banner rather than inventing a new styling approach.
- The decorative gradient bar-chart strip at the bottom is CSS-drawn (a row of divs with `linear-gradient` fade), not an image asset, consistent with "no image assets needed" precedent from the design-system prompt.
- Course "icon" tiles (black N, Docker whale, blue TS) are rendered as small colored tiles with letterforms/an emoji glyph, matching the reference closely without needing new image assets or new icon packages.
- Keep the page a Server Component (no interactivity requires client JS yet).

## Expected files to touch

- `app/page.tsx`: replace with the new home page (header, hero, search bar, All Courses grid, banner).
- `app/design-system/page.tsx`: new file, the relocated design-system sheet (moved from `app/page.tsx` almost verbatim, importing shared components).
- `app/components/ui.tsx`: new shared module exporting `VertexLogo`, `Badge`, `MetaIcon` (and their shared types), used by both pages.
- `app/components/SiteHeader.tsx`: new shared header component.
- `app/globals.css`: add home-page hero/search/course-grid/banner styles; no change to existing design-system styles other than what naturally moves with them.
- `app/layout.tsx`: update `<title>`/`<meta description>` to a home-page-appropriate default (design-system page keeps its own metadata via its route).

## Requirements

### Header (shared)

- Logo + wordmark on the left, "Courses" and "My Learning" nav links, a bell icon, and a circular avatar on the right, on a hairline bottom border, matching `vertex-home.png`/`vertex-course.png` spacing exactly at desktop width.

### Hero

- "INTELLIGENT LEARNING" pill badge, large Playfair Display two-line headline ("Search your learning in plain English."), centered subhead copy, centered primary CTA button "Explore Courses" with a trailing arrow, and a full-width rounded search bar below with a search icon, placeholder "Ask anything about your learning...", and a "⌘ K" key hint aligned right — all centered in the page column, matching type sizes/weights/spacing/colors from the reference.

### All Courses section

- Section heading "All Courses" left-aligned, "View all courses" link with trailing arrow right-aligned, a responsive 3-column card grid at desktop width containing the three sample course cards (icon tile, title, description, and a meta row with level/duration/module-count icons+labels), reusing the existing card and meta-icon patterns.

### Closing banner

- Centered row with a star icon, "New courses and lessons added every week." text, and thin horizontal rules flanking it, followed by the decorative fading bar-chart strip at the very bottom of the page.

### Responsive behavior

- Header collapses sensibly on narrow widths (nav links may wrap or the layout may stack) without overlap.
- Hero headline/subhead/CTA/search bar stay centered and legible down to 320px, wrapping naturally.
- Course grid collapses from 3 columns to 1 column on narrow viewports.
- No horizontal page overflow at 320px viewport width.

### Accessibility and quality

- Single `h1` for the hero headline; section heading for "All Courses" as an `h2`.
- Search input has an accessible label (visually hidden if needed) in addition to its placeholder.
- Bell and avatar are real interactive-looking elements with accessible names even though they're non-functional placeholders for now.
- Visible keyboard focus preserved on all interactive elements; respect `prefers-reduced-motion`.
- No remote runtime images; no secrets.

## Security considerations

- Purely presentational, static page: no user input is submitted anywhere, no network calls, no server mutations, no dynamic HTML injection.
- The search input does not call any API in this task, so there is no query-injection or SSRF surface yet; when the real search route is built later it must follow AGENTS.md section 12's grounding and server-only-token rules.
- Placeholder nav links to `/courses` and `/my-learning` are internal relative links only.

## Acceptance criteria

- `/` matches `design/vertex-home.png` at desktop width: header, hero copy/CTA/search bar, All Courses grid with the three sample cards, and the closing banner with decorative bars.
- `/design-system` renders exactly what `/` used to render, unchanged in content.
- `VertexLogo`, `Badge`, and `MetaIcon` exist once, in `app/components/ui.tsx`, imported by both pages — no duplicated component definitions.
- Page remains usable and unclipped at tablet and mobile widths.
- No Sanity/data-fetching work is introduced; course cards are explicitly local sample data (documented in code as such is unnecessary per the no-comments default, but the prompt file here records the reasoning).
- TypeScript, ESLint, and production build checks pass.

## Checks to run

From `/data/vertex`:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. Start `npm run dev`, load `/` and `/design-system`, confirm both render without runtime errors.
5. Compare `/` against `design/vertex-home.png` at a 1024px viewport, then inspect at 768px, 390px, and 320px widths.

## Exact manual test steps

1. Open `/` and verify the header (logo, Courses, My Learning, bell, avatar), hero (pill, headline, subhead, CTA, search bar), All Courses grid (3 cards with correct titles/descriptions/meta), and the closing banner all appear in the same order and layout as `design/vertex-home.png`.
2. Open `/design-system` and verify it is identical to the previous `/` content (all 14 numbered sections still present).
3. Tab through the header links, bell, avatar, CTA button, search input, and "View all courses" link; confirm visible focus on each and that nothing throws a client error.
4. Resize to 768px, then 390px, then 320px; confirm the header, hero, and course grid reflow without overlap, clipped text, or horizontal scrolling of the page itself.
5. Confirm the browser console has no errors or hydration warnings on either route.
