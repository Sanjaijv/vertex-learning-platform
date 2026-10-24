# Implement Vertex Search Page UI

## Goal

Reproduce the supplied Vertex search-page reference in the existing Next.js App Router application while preserving the current Sanity-backed search behavior. The page must remain a full results page with video-moment and lesson result cards, sorting, empty/error/loading states, and links into the existing lesson/course routes.

## Skills and guidance read

- `sanity-best-practices`, including the Next.js/Sanity integration guidance.
- Existing Vertex project guidance in `AGENTS.md`.
- Installed Next.js App Router conventions available under `node_modules/next/dist/docs/`.

## Existing code inspected

- `app/search/page.tsx`: server page, query-string parsing, metadata, and shared header.
- `app/search/search-results.tsx`: client-side search request, result sorting, result cards, loading/error/empty/callout states.
- `app/globals.css`: existing design tokens, shared layout styles, search-page styles, and responsive breakpoints.
- `app/components/SiteHeader.tsx` and `app/components/ui.tsx`: header/navigation and Vertex branding.
- `app/lib/search-types.ts`: Sanity search response/result types.
- `sanity/lib/search.ts`: server-only Sanity content lookup, chapter/transcript matching, score ordering, and image URL generation.
- `app/api/search/route.ts`: validated search API boundary and error handling.
- `next.config.ts` and `sanity/lib/image.ts`: Sanity image host configuration and URL builder.
- `design/vertex-search.png`: supplied visual reference.

## Decisions and assumptions

- Keep the existing server/client boundary: the browser calls only `/api/search`; Sanity, Context MCP, OpenAI, and tokens remain server-side.
- Keep current result semantics and routes. Video cards continue to link to `/lessons/<slug>?start=<seconds>` and lesson cards to `/lessons/<slug>`.
- Use existing Lucide icons, Inter/Playfair fonts, Vertex tokens, and current component patterns; do not add a UI dependency.
- Treat the supplied desktop image as the visual source of truth and make the page usable on narrow screens by stacking card content without changing desktop composition.
- Do not add fabricated content, hard-coded search results, or fake Sanity data. Any visible result text remains sourced from the validated `SearchResponse`.
- Preserve existing loading, failure, no-results, and catalog-callout behavior, improving only their presentation if necessary to match the page.

## Expected files to touch

- `app/search/search-results.tsx`: only where markup or accessibility semantics must change to support the reference layout, keyboard interaction, or course identity presentation.
- `app/globals.css`: search-page/header-adjacent styles, responsive rules, and any narrowly scoped visual refinements.
- `app/components/SiteHeader.tsx` or `app/components/ui.tsx`: only if the reference requires a small reusable header/brand adjustment that should not be duplicated in search.

Do not modify Sanity schemas or search query logic unless implementation reveals a concrete data-shape defect required for the reference page to render real content.

## Requirements

1. Match the reference’s centered canvas, subtle warm background, horizontal header divider, header spacing, and page max width.
2. Match the search heading hierarchy:
   - small `SEARCH RESULTS` pill;
   - Playfair heading with the query quoted and orange;
   - result/course count line;
   - correctly sized search field with icon, query value, and keyboard hint affordance.
3. Match the results toolbar with the result count and right-aligned “Most Relevant” control.
4. Match video cards:
   - wide 16:9 thumbnail area with rounded corners;
   - Sanity poster image when present and a restrained fallback when absent;
   - centered play affordance and duration badge;
   - course identity row, lesson title, concise description, lesson/module metadata, VIDEO badge, and orange watch-from action.
5. Match lesson cards:
   - document/key-point preview treatment instead of a video thumbnail;
   - LESSON badge and view-lesson/external-link affordance;
   - metadata appropriate to lesson results.
6. Match borders, radii, spacing, type scale, icon sizing, orange/purple status colors, and hover/focus states without changing global unrelated pages.
7. Keep all controls accessible:
   - labeled search input;
   - semantic form and select;
   - visible focus styles;
   - meaningful image alt behavior;
   - status/error announcements.
8. Preserve or improve responsive behavior for mobile: avoid horizontal overflow, stack cards, keep actions reachable, and retain the catalog callout.
9. Ensure the final result remains driven by Sanity content and is compatible with existing `next/image` remote configuration.

## Security and reliability

- No client-side Sanity token, Context MCP call, OpenAI call, or write operation.
- Do not weaken API validation or replace explicit errors with success-shaped fallbacks.
- Keep result links URL-safe and preserve the existing query-length limit.
- Avoid introducing raw HTML or untrusted markup from search content.

## Acceptance criteria

- `/search?q=data%20fetching` visually follows the supplied reference at desktop width.
- Real Sanity-backed video and lesson results render with their existing data and links.
- Sorting still changes the displayed order without another API request.
- Loading, API failure, empty results, and no-query states remain understandable and styled consistently.
- Keyboard navigation and visible focus states work for the search form, sort control, result links, and catalog link.
- Narrow viewports do not overflow and cards remain readable.
- No unrelated page styling regresses.

## Checks to run

From the repository root:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

If the build requires configured services, report the exact failure rather than masking it. If a dev server is started for visual verification, use the existing `npm run dev` script and stop it after verification.

## Manual test steps

1. Start the web app with `npm run dev`.
2. Open `/search?q=data%20fetching`.
3. Confirm the header, heading, search field, toolbar, card geometry, badges, actions, and bottom catalog callout against `design/vertex-search.png`.
4. Activate a video result and verify it navigates to the lesson with the `start` query parameter.
5. Activate a lesson result and verify it navigates to the lesson route.
6. Change the sort control and verify the visible order changes.
7. Test an unknown query and verify the empty state links to `/courses`.
8. Test a narrow viewport and keyboard-only navigation.
