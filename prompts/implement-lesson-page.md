# Implementation prompt: Lesson page

## Goal

Implement `/lessons/[slug]` to match `design/vertex-lesson.png` at desktop size and adapt cleanly to mobile. Render the real seeded lesson and its parent course from the private Sanity dataset. Play the lesson's video inside the page, including an optional validated `?start=<seconds>` deep link.

## Guidance and code inspected

- `AGENTS.md`: approval workflow; exact desktop UI and responsive mobile; server-only private Sanity reads; module and lesson relationships; in-page provider playback; Notes tab and bookmark are presentational; no fabricated progress.
- `sanity-best-practices/SKILL.md`, `references/nextjs.md`, `references/groq.md`, `references/portable-text.md`: typed GROQ queries, server data access, Portable Text rendering, embed URL storage.
- Local Next.js 16 docs: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` and `01-getting-started/05-server-and-client-components.md`. Route params and search params are promises; the page remains a Server Component with small Client Components for interaction.
- Design: `design/vertex-lesson.png`; shared design system in `app/globals.css`, `app/components/ui.tsx`, `SiteHeader.tsx`, and existing course page.
- Existing data layer: `sanity/lib/{queries,data,fetch,client}.ts`, `sanity.types.ts`, lesson/course schemas, seed NDJSON, and YouTube ingestion script.
- Seed facts: 10 courses, 120 lessons; all seeded `videoUrl`s are YouTube watch URLs; each course has four ordered modules with three lessons each. Seed lesson images are stored under `thumbnail`, although the current schema/query names that field `poster`. Notes, key points, pro tips, and resources are present; most seed resource types are `link`.
- No learner progress schema or server route currently exists. The previous course-page prompt explicitly deferred progress UI until progress tracking exists.

## Decisions and assumptions

- Add a real lesson route at `/lessons/[slug]`, consistent with links already emitted by the course page. Unknown slugs or lessons outside a course return 404.
- Fetch lesson by slug and its parent course via the existing reverse-reference helper. Extend the parent-course projection only with fields needed here: course level and its instructor as well as ordered module lessons with durations. Do not store parent course on lesson.
- Derive the module number, lesson number, preceding lesson, and following lesson from the course's ordered module references. The design's 12-module/35%-complete example is sample content; show the seed's actual course/module count and lesson data.
- Build the left outline as a small Client Component. It opens the current module by default; clicking another module toggles its lessons. Every lesson title links to its route; the current lesson is highlighted. Show real durations. Omit completion checks and percent progress because there is no real progress record. Use a neutral lesson marker for other rows.
- Render the video with YouTube's own `youtube-nocookie.com` iframe player, using its native controls and `start` parameter. Accept normal seeded watch URLs and safe YouTube short/embed forms; extract and validate the video ID before building the embed URL. Normalize `start` to a finite nonnegative integer, clamp to the lesson duration, and treat missing/invalid values as zero. No third-party page navigation or custom player. Since ingestion currently supports only YouTube and every seeded lesson is YouTube, additional providers are outside this change; unsupported future URLs get an honest unavailable-player message.
- Use the seed's Portable Text notes for the Notes tab via `@portabletext/react`; install it if absent. The default Lesson Content tab shows an overview derived from the first normal notes paragraph, real key points, optional pro tip, and real resources. The tabs change visible content locally and have no backend of their own. Do not duplicate the entire notes body in the overview.
- Resource URLs must be validated to `http:` or `https:` before becoming links, open in a new tab with `rel="noopener noreferrer"`, and be rendered according to their stored type/title/description. Only actual resources appear.
- Reuse the existing SiteHeader, formatting helpers, tokens, fonts, and icon patterns. Keep the page mostly server rendered. A small client tab/outline component and iframe remount keyed by validated start value are acceptable.
- Use the existing local bookmark toggle pattern for visual fidelity if appropriate. It is local UI only and must not imply persistence.
- Do not add progress writes, play metrics, fake completion status, new content documents, Studio schema changes, or provider ingestion in this page task.

## Expected files to touch

- `sanity/lib/queries.ts`: enrich `COURSE_FOR_LESSON_QUERY` for parent course, module order, sibling slugs/durations, instructor and level.
- `sanity.types.ts`: regenerate from query changes with the Studio's TypeGen command.
- `app/lessons/[slug]/page.tsx`: new server-rendered lesson route, metadata, validated start, breadcrumb, content, resources, and navigation.
- `app/components/LessonOutline.tsx`: interactive course outline and current lesson state.
- `app/components/LessonTabs.tsx`: local tab switching for Lesson Content and Notes, with Portable Text notes.
- `app/components/LessonVideo.tsx` or `app/lib/video.ts`: safe YouTube URL parsing and provider iframe construction; keep parsing server side if no client state is needed.
- `app/globals.css`: lesson page styles and responsive behavior, scoped to lesson classes.
- `package.json` and lockfile: add `@portabletext/react` if required.

### Verification adjustments found during implementation

- `next-sanity` already provides the installed Portable Text renderer, so use its `PortableText` re-export without adding a redundant direct dependency. The package registry was unreachable during the direct-install attempt.
- The existing `studio/package.json` TypeGen script used a `--force` flag that the installed Sanity CLI rejects. Remove that flag so the required TypeGen check can run and regenerate `sanity.types.ts`.
- This sandbox drops stdout from spawned child processes, which prevents Next 16's default TypeScript CLI checker from parsing `tsc --showConfig`. Set `experimental.useTypeScriptCli: false` in `next.config.ts` to use Next's documented TypeScript API checker; still run standalone `npx tsc --noEmit` separately.

## Requirements

1. Reproduce the desktop structure: shared top bar; left course outline; right breadcrumb, lesson label/title/summary/meta; 16:9 player; tabs; overview, points, tip, resources; previous/next footer. Keep the clean white canvas, fine warm borders, orange emphasis, serif headings, and spacing of the reference.
2. At narrow widths, the outline becomes collapsible above the content; navigation, player, tabs, and resources remain usable at 320px without horizontal overflow.
3. All course, module, lesson, duration, student count, instructor, notes, key point, tip, resource, and previous/next values come from Sanity or direct derivation from its ordered references. Do not hardcode reference-image labels or numbers.
4. The YouTube video is playable on the lesson page with native controls; `/lessons/<slug>?start=45` starts at second 45. Invalid `start` values do not break rendering.
5. Notes render from Portable Text, with safe link marks. The Lesson Content and Notes tabs are keyboard accessible and reflect the selected state with ARIA.
6. The route is public, like current browsing pages. Sanity token stays server only. No content or progress writes occur from the browser.
7. Both an unknown lesson slug and a lesson with no parent course return a 404.

## Security considerations

- Validate the provider and extracted YouTube ID; never place the raw Sanity URL into an iframe `src`.
- Sanitize/clamp the untrusted `start` query value before using it in the embed URL.
- Keep Sanity queries in server-only data helpers; send only display data to Client Components.
- Allow only safe HTTP(S) resource and Portable Text links. External links use `noopener noreferrer`.
- Do not expose the private Sanity token or add client-side Sanity requests.

## Acceptance criteria

- A seeded lesson route renders the matching course and module context, current lesson, real content, previous/next lesson links, and an in-page playing YouTube embed.
- A deep link with `?start=45` makes the embed start at 45 seconds; malformed values safely fall back to zero.
- Outline links and tabs work, and the mobile outline can be opened and closed.
- Real seeded counts replace the sample 12 modules/35% progress in the image; no fabricated completion indicators appear.
- Type check, lint, and production build pass. The dev server serves a seeded lesson route without a runtime error.

## Checks to run

1. In `studio/`, run `npm run typegen` after changing the query.
2. In the repository root, run `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
3. Run `npm run dev`, request a known lesson route, a `?start=45` route, and an unknown slug; inspect the output and status codes.
4. If browser tooling is available, compare the rendered page with `design/vertex-lesson.png` at 1024px, then check 768px, 390px, and 320px; verify playback manually in a browser.

## Exact manual test steps

1. Open `/lessons/nextjs-app-router-in-depth-fetching-in-server-components`. Check the course name, Data Fetching and Caching module, lesson label/title, real duration/student count, overview, key points, pro tip (if present), and resource cards.
2. Press Play in the embedded player and confirm the lesson plays without leaving Vertex.
3. Open the same URL with `?start=45`. Press Play and confirm playback begins around 0:45. Try `?start=abc` and confirm the page still loads at the beginning.
4. Click Notes and confirm the stored Portable Text appears; switch back to Lesson Content.
5. Expand another module and navigate to one of its lessons; confirm the highlighted row, breadcrumb, player, and content all update.
6. Use Previous Lesson and Next Lesson. Check that the first/last lesson only offers the valid direction.
7. Open `/lessons/does-not-exist`; confirm a 404.
8. Resize to 768px, 390px, and 320px; confirm the outline can be opened, the video is visible, resources stack, and there is no horizontal overflow.
