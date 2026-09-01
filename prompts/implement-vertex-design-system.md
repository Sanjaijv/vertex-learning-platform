# Implementation prompt: Vertex design system

## Goal

Replace the default Next.js starter screen with a production-quality, responsive design-system showcase that reproduces `design/vertex-designsystem.png` as closely as possible. The page should also establish reusable Vertex visual tokens and component patterns for later catalog, course, lesson, and search work.

## Guidance inspected

- `AGENTS.md`, especially the visual fidelity, scope, workflow, and verification requirements.
- `design/vertex-designsystem.png` at its native 1024 × 1536 resolution.
- Next.js 16.3.3 local docs for App Router layouts/pages, global CSS/Tailwind CSS, and `next/font`.
- Existing starter implementation in `app/layout.tsx`, `app/page.tsx`, and `app/globals.css`.
- Existing package and build configuration in `package.json`, `tsconfig.json`, `next.config.ts`, and the Tailwind/PostCSS setup.

## Current state

- The repository is the default App Router starter with no established Vertex components.
- Tailwind CSS 4 is already configured through `@tailwindcss/postcss` and `@import "tailwindcss"`.
- The root page, fonts, metadata, colors, and dark-mode behavior are still starter defaults.
- No icon package is installed.

## Decisions and assumptions

- Implement the reference as the `/` page because no alternate route was requested and the root page is currently disposable starter content.
- Treat the reference as the desktop source of truth. At narrower widths, preserve all specimens and content while stacking and wrapping sections in reading order.
- Build a live HTML/CSS component showcase, not a flattened image.
- Define Vertex colors, typography, spacing, radii, shadows, and reusable control/card styles as named CSS variables and component classes in the global theme.
- Use `Playfair Display` for display typography and `Inter` for interface/body typography via `next/font/google`, with the fonts self-hosted by Next.js.
- Add `lucide-react` for the consistent 24 px outline/filled-style icon specimens and component icons. Use small CSS/SVG treatments for the Vertex mark and any icon state not directly supplied by Lucide.
- Keep the page a Server Component; the design-system sheet is presentational and needs no client JavaScript.
- Use semantic HTML, real buttons/inputs/selects/links, visible keyboard focus, accessible labels, sufficient tap targets, and non-color status cues.
- Remove the starter dark-mode override because the supplied design is explicitly light and no dark reference exists.
- Reproduce the page’s soft warm canvas, white bordered panels, typography scale, swatches, spacing/radius/shadow demonstrations, icon sets, controls and their states, status indicators, cards, navigation, breadcrumbs, pagination, and four principles.
- Do not add product data, routes, authentication, Sanity, search behavior, or other features outside this design-system sheet.

## Expected files to touch

- `app/page.tsx`: complete semantic design-system showcase and local specimen data.
- `app/globals.css`: Vertex design tokens, Tailwind theme mapping, reusable component primitives, responsive page layout, and specimen styling.
- `app/layout.tsx`: Vertex fonts, document classes, and page metadata.
- `package.json` and `package-lock.json`: add `lucide-react`.

No image assets need to be generated; the reference contains abstract UI, logo geometry, and icons that can be rendered in code.

## Requirements

### Page shell and brand

- Match the reference’s warm off-white background, slim outer gutters, subtle panel borders, rounded corners, and generous but compact vertical rhythm.
- Recreate the orange Vertex triangular mark and wordmark.
- Include the left intro panel with title, description, version, and date.

### Foundations

- Render the primary and neutral color ramps with labels and hex values from the reference.
- Render the Playfair Display and Inter typography specimens.
- Render the full type-scale table with style, font, size/line-height, weight, and use.
- Render the 4 px-based spacing scale, radius samples, and four shadow samples.

### Components

- Render outline and visually filled icon rows plus icon specifications.
- Render button rows for default, hover-preview, and disabled states across primary, secondary, tertiary, and text treatments.
- Render search/text input and select specimens plus field specifications.
- Render badges/tags, statuses, progress, four card patterns, navigation, breadcrumbs, and pagination.
- Render the four principles at the bottom with suitable icons and copy.
- Match type sizes, border weights, orange accents, muted neutrals, and density to the supplied image.

### Responsive behavior

- Keep the reference’s multi-column desktop composition at large widths.
- Collapse the intro/colors hero, typography/type-scale, spacing/radius, component grids, cards, and footer principles into sensible one-column or two-column layouts on tablets and phones.
- Allow wide specimen rows and tables to scroll locally when required rather than shrinking text below legible sizes.
- Avoid horizontal page overflow at 320 px viewport width.

### Accessibility and quality

- Use a single page-level `h1` and ordered section headings.
- Associate labels with form controls and provide accessible names for icon-only examples.
- Preserve visible focus styles and respect `prefers-reduced-motion`.
- Use stable list keys and valid HTML nesting.
- Do not use remote runtime images or expose secrets.

## Security considerations

- This is a static presentational page with no user data, network calls, credentials, HTML injection, or server mutations.
- External-looking specimen links should not navigate to unsafe or undefined destinations; use inert buttons or local placeholder links with prevented/benign behavior as appropriate.
- Keep all SVG/icon content generated by trusted local code and dependencies.

## Acceptance criteria

- `/` closely matches `design/vertex-designsystem.png` at desktop width, including all 14 numbered sections and the same visible content hierarchy.
- Vertex tokens and reusable primitive classes are centralized rather than repeated as arbitrary one-off values throughout the JSX.
- The page remains polished and usable at tablet and mobile widths without clipped page content.
- Fonts are Playfair Display and Inter, loaded with `next/font`.
- Interactive primitives have semantic elements, clear disabled states, hover previews, and keyboard-visible focus.
- No default Next.js starter branding or dark-mode starter styling remains.
- TypeScript, ESLint, and production build checks pass.

## Checks to run

From `/data/vertex`:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. Start `npm run dev`, load `/`, and confirm the page renders without runtime errors.
5. Compare the running page against `design/vertex-designsystem.png` at a 1024 px viewport and inspect at 768 px, 390 px, and 320 px widths.

## Exact manual test steps

1. Open the root page and verify the Vertex logo, introduction, and all sections numbered 01 through 14 appear in order.
2. At 1024 px wide, compare the panel grid, typography, swatches, component states, cards, navigation row, and principle row with the supplied reference.
3. Tab through buttons, input, select, links, and pagination; verify focus is always visible and disabled buttons cannot be activated.
4. Resize to 768 px and verify the major two-column regions collapse without overlap or illegible labels.
5. Resize to 390 px and 320 px; verify there is no page-level horizontal scrolling, while any intrinsically wide table/specimen area scrolls within its own panel.
6. Confirm the browser console has no errors or hydration warnings.
