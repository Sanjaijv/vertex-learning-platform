# Sanity content model, standalone Studio, and server-side data layer

## Goal

Build the Sanity content model for Vertex (`course`, `module`, `lesson`, `instructor`, `category`), migrate the Studio to a standalone workspace per AGENTS.md section 5, and build the server-only read client + data-fetching layer the web app will use to read this content. No pages, no search, no progress tracking — those are separate tasks.

## Skills read

- `sanity-best-practices` → `references/schema.md`, `references/nextjs.md`, `references/typegen.md`, `references/studio-structure.md`.

## Code inspected

- Root `package.json`: single Next.js app, no workspaces. Deps include `sanity`, `@sanity/vision`, `next-sanity`, `@sanity/image-url`, `@clerk/nextjs`.
- `sanity.config.ts` / `sanity.cli.ts` (root): embedded Studio config, `basePath: '/studio'`.
- `app/studio/[[...tool]]/page.tsx`: mounts `<NextStudio />` — the embedded Studio route.
- `sanity/env.ts`, `sanity/lib/client.ts`, `sanity/lib/image.ts`, `sanity/lib/live.ts`, `sanity/schemaTypes/index.ts` (empty), `sanity/structure.ts`: scaffolded by `sanity init`, mostly boilerplate/empty.
- `.env.local` / `.env.example`: currently only Clerk vars + `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`. No read token, no server-only Sanity env var.
- `app/layout.tsx`: root layout wraps children in `<ClerkProvider>`; does not currently render `<SanityLive />`.
- Confirmed with user: AGENTS.md section 5 requires the Studio as its own standalone workspace, not embedded in Next.js. Current scaffold violates this — **migrating to a standalone Studio is in scope for this task** (user confirmed).

## Decisions and assumptions

1. **Studio becomes `studio/`, a fully standalone package** (own `package.json`, own `node_modules`, own `sanity.config.ts` / `sanity.cli.ts`), run with `npm run dev` inside `studio/` (port 3333). The repo root keeps acting as the `web` workspace (it already holds `app/`, and AGENTS.md's "web workspace" responsibilities map directly onto it) — I'm not renaming the root into a `web/` subfolder, since that would move Clerk, the design system, and every existing route for no benefit beyond the name. `app/studio/[[...tool]]/` is deleted; the root `sanity.config.ts` / `sanity.cli.ts` are deleted (moved into `studio/`).
2. **No `defineLive` / Live Content API.** The skill recommends it by default, but it works by shipping a `browserToken` to the client so the browser can hold an SSE subscription — that means a read token in the browser bundle. AGENTS.md section 12 is explicit: the dataset is private, the token stays server-only, and the browser never talks to Sanity directly. So `sanity/lib/live.ts` is deleted, and the web app instead gets a plain server-only fetch helper (`sanity/lib/fetch.ts`) that calls `client.fetch()` with Next's `revalidate`/`tags` caching. This also means no `<SanityLive />` in `app/layout.tsx` — nothing to add there in this task.
3. **`sanity/lib/client.ts` becomes the one server-only client**, built with `SANITY_API_READ_TOKEN` (no `NEXT_PUBLIC_` prefix, so it can't leak into a client bundle) and `useCdn: false` (a tokened private-dataset client bypasses the CDN anyway). Nothing under `sanity/lib/` is ever imported from a Client Component.
4. **Field types for anything AGENTS.md section 8 leaves open** (my call, kept minimal):
   - `course.level`: string with `options.list` (Beginner / Intermediate / Advanced), radio layout — not free text, per schema skill's boolean-vs-list guidance.
   - `course.price`: number.
   - `course.outcomes[]`: object `{ icon: string, title: string, description: text }` — `icon` is a free-text icon name (matches how the design system already references `lucide-react` icons by name; no icon picker needed).
   - `lesson.duration`: string (e.g. `"12:34"`) — display-only, no runtime arithmetic needed anywhere in this task.
   - `lesson.resources[].type`: string with `options.list` (`link`, `pdf`, `download`) — extendable later without a schema break.
   - `module` and `outcome` and `resource` are `object` types (embedded, not documents) per AGENTS.md section 8 ("a module is an embedded object inside a course, not its own document").
   - `lesson.notes`: standard Portable Text (`array` of `block`), headings H2–H4, normal marks (strong/em/link), bullet/number lists. No custom embedded objects — nothing in section 8 asks for images/code blocks inside lesson notes.
5. **Reverse reference for "derive the course from a lesson"**: per AGENTS.md section 8, a lesson does not store its parent course. `getCourseForLesson(lessonId)` in the data layer does `*[_type == "course" && references($lessonId)][0]`. No schema change needed for this — it's a query concern.
6. **IDs**: course/module/lesson/instructor/category are ordinary documents — Sanity-generated `_id`s, connected by `reference` fields, per the schema skill's global rule. No singletons in this task (the agent-context document and progress records are out of scope here).
7. **TypeGen**: enabled in `studio/sanity.cli.ts`, schema extracted from `studio/`, queries scanned from the root web app (`app/**/*.{ts,tsx}` and `sanity/**/*.{ts,tsx}`), output to root `sanity.types.ts` (already covered by the root `tsconfig.json`'s `**/*.ts` include).
8. **Env var split**: `studio/` gets its own `.env.example` using the Sanity CLI's own convention (`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`) so `sanity.cli.ts`/`sanity.config.ts` in `studio/` pick them up automatically. The root `.env.example` keeps `NEXT_PUBLIC_SANITY_PROJECT_ID`/`NEXT_PUBLIC_SANITY_DATASET` (the web app's own client-safe project/dataset config) and gains `SANITY_API_READ_TOKEN` (server-only).

## Files to touch

**New `studio/` workspace**
- `studio/package.json` — own deps: `sanity`, `@sanity/vision`, `@sanity/icons`, `react`, `react-dom`, `styled-components`, `typescript`.
- `studio/tsconfig.json`
- `studio/sanity.config.ts` — moved/adapted from root (`basePath` removed, no longer mounted under `/studio`; project id/dataset from `SANITY_STUDIO_*` env).
- `studio/sanity.cli.ts` — moved/adapted, `typegen` config added.
- `studio/schemaTypes/index.ts` — registers all schema types.
- `studio/schemaTypes/documents/course.ts`
- `studio/schemaTypes/documents/lesson.ts`
- `studio/schemaTypes/documents/instructor.ts`
- `studio/schemaTypes/documents/category.ts`
- `studio/schemaTypes/objects/module.ts`
- `studio/schemaTypes/objects/outcome.ts`
- `studio/schemaTypes/objects/resource.ts`
- `studio/structure.ts` — moved, lists the four document types.
- `studio/.env.example`
- `studio/.gitignore`

**Deleted**
- `app/studio/[[...tool]]/page.tsx` (and the now-empty `app/studio/` tree)
- root `sanity.config.ts`
- root `sanity.cli.ts`
- `sanity/schemaTypes/index.ts` (empty placeholder, superseded by `studio/schemaTypes`)
- `sanity/lib/live.ts` (Live Content API not used — see Decision 2)

**Web data layer (root)**
- `sanity/env.ts` — unchanged (still the client-safe project id/dataset for the web client).
- `sanity/lib/client.ts` — rewritten: server-only client with `SANITY_API_READ_TOKEN`, `useCdn: false`.
- `sanity/lib/fetch.ts` — new: `sanityFetch()` wrapper over `client.fetch()` with `revalidate`/`tags`.
- `sanity/lib/queries.ts` — new: `defineQuery` GROQ for courses, course detail, lessons, instructors, categories, plus the lesson→course reverse lookup.
- `sanity/lib/data.ts` — new: typed helper functions wrapping each query (`getCourses`, `getCourseBySlug`, `getCourseSlugs`, `getLessonBySlug`, `getCourseForLesson`, `getInstructorBySlug`, `getInstructors`, `getCategories`, `getCategoryBySlug`).
- `sanity/lib/image.ts` — unchanged.

**Root config**
- `package.json` — drop `sanity`, `@sanity/vision` (moved into `studio/`); keep `next-sanity`, `@sanity/image-url`.
- `.env.example` / `.env.local` — add `SANITY_API_READ_TOKEN`.
- `.gitignore` — add `studio/node_modules` if not already covered (root `.gitignore` already ignores `/node_modules` at repo root only, not nested — check and extend if needed).

## Requirements

- Schema fields match AGENTS.md section 8 exactly for what's fixed (course/module/lesson/instructor/category shape, module as embedded object, lesson has no parent-course field). Everything left open is decided above.
- Every document/object type uses `defineType`/`defineField`/`defineArrayMember`, has an icon, and slugs use `options.source` + a `slugify` that lowercases/hyphenates.
- Studio runs standalone (`npm run dev` inside `studio/`), independent of the Next.js app's build/dev cycle.
- The web app never imports a Sanity token into anything that can reach the browser. `sanity/lib/client.ts` and everything that imports it stays server-only (Server Components / route handlers / server actions only — nothing in `app/` marked `'use client'` may import from `sanity/lib`).
- `sanity/lib/data.ts` functions are the only sanctioned way pages will read content later — plain, small, one function per query, no speculative generality (no generic "queryContent(type, filters)" abstraction).
- Cross-referenced fields go through GROQ dereferencing (`->`) in queries, not manual joins in application code.

## Security considerations

- `SANITY_API_READ_TOKEN` stays out of `NEXT_PUBLIC_*` and is read only inside `sanity/lib/client.ts`.
- Studio's own env vars (`SANITY_STUDIO_PROJECT_ID`/`DATASET`) are separate from the web app's; Studio needs its own auth (Sanity user login) to write, not the read token.
- `.env.local` (root) and any `studio/.env.local` stay gitignored; only `.env.example` files are committed, with blank values.
- No write token appears anywhere in this task — this is read-only content modeling and fetching, consistent with AGENTS.md ("pages are read only").

## Acceptance criteria

- `npm install` succeeds in both root and `studio/`.
- `studio/`: `npm run dev` starts the Studio on :3333, all five schema types (course, lesson, instructor, category, plus module/outcome/resource as nested objects) appear and are usable — can create an instructor, a category, a lesson, then a course that references them and embeds a module referencing the lesson.
- Root: `npm run build` succeeds with the Studio route removed and the new data layer in place (no unresolved imports).
- `sanity.types.ts` generates at the repo root (via Studio's typegen) and root TypeScript picks it up (already covered by `tsconfig.json`'s `**/*.ts`).
- `sanity/lib/data.ts` functions type-check against the generated types and successfully fetch real content once a dataset with test documents exists.
- No file under `app/` that has `'use client'` imports anything from `sanity/lib`.

## Checks to run

- Root (web): `npm run lint`, `npx tsc --noEmit` (or the project's type-check script if one exists), `npm run build`.
- `studio/`: `npx sanity schemas extract --force && npx sanity typegen generate` (or rely on `sanity dev`/`sanity build` auto-typegen), then `npx sanity build` to confirm the Studio itself builds. Studio deploy (`npx sanity deploy`) is left to the user since it requires their Sanity project auth — I'll report it as a manual follow-up, not run it myself.

## Manual test steps

1. In `studio/`, run `npm install` then `npm run dev`; open `http://localhost:3333`.
2. Create one Category, one Instructor.
3. Create one Lesson (fill title, slug, video URL, duration, key points, notes).
4. Create one Course referencing that Instructor and Category, with one Module containing that Lesson.
5. Confirm the Course document shows Module 1 / Lesson 1.1 style ordering implicitly (order comes from array position, not a stored number — nothing to type in for numbering).
6. From the root, run `npx tsc --noEmit` and confirm `sanity/lib/data.ts` compiles against `sanity.types.ts`.
7. Add `SANITY_API_READ_TOKEN` (a Viewer token from manage.sanity.io) to root `.env.local`, then in a scratch server file/route call `getCourses()` and confirm it returns the course created in step 4.
8. Run root `npm run build` and confirm it succeeds with no `/studio` route present.
