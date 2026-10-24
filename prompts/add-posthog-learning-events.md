# Add PostHog learning events

## Goal

Extend the existing PostHog integration to measure the core learning funnel and search engagement without sending personally identifiable information in event properties. Keep the current Next.js App Router, Clerk, Sanity, and client/server boundaries intact.

## Skills and guidance read

- `integration-nextjs-app-router`
- `references/COMMANDMENTS.md`
- `references/EXAMPLE.md`
- `references/identify-users.md`
- `references/next-js.md`

## Existing code inspected

- `instrumentation-client.ts` initializes `posthog-js`.
- `app/components/PostHogIdentity.tsx` identifies Clerk users by Clerk user ID and currently includes email/name person properties.
- `app/search/search-results.tsx` captures `search_performed` after the client receives search results.
- `app/api/search/route.ts` is the server-side search boundary.
- `app/lessons/[slug]/page.tsx` renders a YouTube iframe with an optional `start` query parameter, but currently has no player event boundary.
- `app/components/CourseStartLink.tsx`, `CourseContent.tsx`, and `Bookmark.tsx` already capture course engagement events.
- `app/components/LessonBookmark.tsx`, `LessonTabs.tsx`, `LessonOutline.tsx`, and the course/search pages provide additional client interaction surfaces.
- No progress API or completed/resume persistence implementation is currently present in the inspected app tree.

## Decisions and assumptions

- Use PostHog's established snake_case event naming.
- Keep the existing events and add only missing, meaningful actions.
- Capture search query text because the requested event explicitly requires the query; do not add email, name, title/body content, transcript text, notes, or other account/user-generated fields to events.
- Use stable content identifiers and slugs, result kind, counts, and numeric playback values only.
- Capture search completion on the client, where the user action and result payload are available. Capture the server-side search request separately only if it can be correlated without duplicating the same user action; otherwise do not double-count.
- Use `posthog-node` only for server-side events that represent server-owned mutations or requests, with `flushAt: 1`, `flushInterval: 0`, and an awaited flush. Do not import `posthog-js` into route handlers.
- Instrument the supported YouTube embed with the provider's postMessage/IFrame API in a reusable client component. Track play once per lesson view, watch-depth milestones at 25%, 50%, 75%, and 100% once each, and the initial resume seek when `start > 0`. Do not send video URLs, transcript text, or free-form content.
- Since no lesson progress write route exists in the inspected code, add `lesson_completed` and `lesson_resume_used` at the client interaction boundary only where the current implementation can establish the action. Do not invent persistence or a new progress backend as part of analytics work.
- Existing Clerk identity behavior remains the source of the PostHog distinct ID; do not add PII to capture properties.

## Planned events

1. `search_performed`: query, result_count, course_count; emitted once when a valid search response arrives.
2. `search_result_opened`: result_type (`video` or `lesson`), course_slug, lesson_slug, module_position, lesson_position, and for video results the start_seconds; emitted from result links.
3. `video_played`: lesson_slug, course_slug, start_seconds, and resume_used; emitted on the first player play for a lesson view.
4. `video_watch_depth_reached`: lesson_slug, course_slug, depth_percent, watched_seconds, and duration_seconds; emitted once per 25/50/75/100 milestone.
5. `lesson_resume_used`: lesson_slug, course_slug, resume_seconds; emitted when a lesson is opened with a valid non-zero start position and the player begins from it.
6. `lesson_completed`: lesson_slug, course_slug, duration_seconds; emitted when playback reaches the end milestone.
7. `lesson_notes_viewed`: lesson_slug, course_slug; emitted when the Notes tab is selected.
8. Preserve and review existing `course_started`, `course_bookmark_toggled`, `course_module_toggled`, `course_modules_list_toggled`, and `search_performed` events for consistent properties and guarded initialization.

## Expected files

- `instrumentation-client.ts` (only if initialization options need a compatibility adjustment)
- `app/search/search-results.tsx`
- `app/components/LessonVideo.tsx` (new reusable client player wrapper)
- `app/lessons/[slug]/page.tsx`
- `app/components/LessonTabs.tsx`
- `app/components/LessonBookmark.tsx` (only if the existing bookmark action is intentionally included)
- `app/api/search/route.ts` and a server analytics helper only if server-side capture is required after correlation review
- `package.json` and `package-lock.json` if `posthog-node` is needed
- `.env.example` only if a new server-only PostHog environment variable is required
- `.posthog-events.json` as the machine-readable event plan

## Security and privacy

- Never include email, name, Clerk session data, IP address, video URL, transcript/notes text, or arbitrary page text in capture properties.
- Keep PostHog project tokens in environment variables.
- Keep any server-side PostHog key server-only.
- Validate and clamp numeric playback values before capture.
- Do not let analytics failures block search, lesson playback, or navigation.
- Preserve `posthog-js` browser-only and `posthog-node` server-only usage.

## Acceptance criteria

- Requested search, result-open, video-play, watch-depth, resume, and completion events are emitted at the correct action boundary.
- Events use snake_case names and stable, non-PII properties.
- Duplicate events are prevented within a lesson view and search response.
- Existing events continue to work.
- Missing PostHog configuration does not break production; development diagnostics follow the PostHog skill guidance.
- The YouTube player starts at the requested search/resume position and analytics do not change playback behavior.
- Type checking, linting, and production build pass.

## Checks

From the repository root:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

Manual verification:

1. Open `/search?q=data%20fetching`, submit a valid query, and confirm one `search_performed`.
2. Open both a lesson and a video search result and confirm `search_result_opened` with the correct `result_type`.
3. Open a lesson, play the video, seek/watch through milestones, and confirm one `video_played` plus each applicable `video_watch_depth_reached`.
4. Open a lesson with `?start=<seconds>` and confirm `lesson_resume_used` and playback starts at that position.
5. Play to the end and confirm one `lesson_completed`.
6. Select Notes and confirm `lesson_notes_viewed`.
7. Repeat actions within the same view and confirm milestone events are not duplicated.
