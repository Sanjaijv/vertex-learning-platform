# Fix blank lesson videos after client navigation

## Goal

Ensure lesson videos render their YouTube thumbnail/player immediately when a learner opens a lesson from the course catalog or moves between lessons with client-side navigation. Preserve the existing refresh behavior, requested start positions, analytics, and server/client boundaries.

## Skills and guidance read

- Next.js App Router guidance from `node_modules/next/dist/docs/`, because the affected page uses App Router client navigation and a client component.
- Existing repository patterns in the lesson page, `LessonVideo`, and `lesson-video` URL helper.

## Existing code inspected

- `app/lessons/[slug]/page.tsx` derives the YouTube embed URL and renders `LessonVideo`.
- `app/components/LessonVideo.tsx` owns the client-side YouTube iframe and IFrame API lifecycle, including PostHog playback analytics.
- `app/lib/lesson-video.ts` validates YouTube URLs and adds the requested `start` query parameter.
- `app/courses/page.tsx` and `app/courses/[slug]/page.tsx` navigate to lessons with normal Next `Link`/`href` navigation.
- The current worktree already contains unrelated, in-progress PostHog and ingestion changes; do not revert or broaden them.

## Diagnosis and decisions

- The failure is specific to client-side lesson transitions: the iframe is black/blank until a hard refresh, while the same lesson renders its thumbnail after refresh.
- The most likely root cause is the current `LessonVideo` effect coupling iframe replacement and `YT.Player` construction/destruction during App Router transitions. The fix should make the iframe identity and player setup deterministic for each embed URL rather than relying on a stale iframe/API lifecycle.
- Keep the existing YouTube embed approach and analytics events. Do not replace the provider player, expose tokens, or add a separate backend.
- Keep invalid/missing URLs showing the existing unavailable message.
- Do not add a custom video player or change the visual layout.

## Requirements

1. Reproduce or reason through a client transition from `/courses` to a lesson and from one lesson to the next.
2. Make each lesson's iframe use the current lesson/embed URL and reliably initialize after a client navigation.
3. Preserve `startSeconds` behavior for search/resume links.
4. Preserve the YouTube IFrame API analytics behavior (`video_played`, watch-depth milestones, resume, and completion) without duplicate listeners or timers.
5. Ensure cleanup from the previous lesson cannot destroy or overwrite the newly mounted lesson player.
6. Keep the change limited to the video component/page/helper unless a directly related test or configuration update is required.
7. Do not modify the attached screenshots or the tagged PostHog prompt.

## Security and reliability

- Continue validating and constructing YouTube URLs through the existing helper.
- Keep `enablejsapi=1` and the existing restrictive referrer policy.
- Do not broaden iframe permissions or accept arbitrary iframe URLs.
- Avoid broad catches or silent success fallbacks; preserve the existing unavailable state for invalid URLs.
- Ensure an API callback from a prior lesson cannot initialize a new/stale iframe after cleanup.

## Acceptance criteria

- Opening a lesson from the catalog displays the YouTube thumbnail/player without requiring a browser refresh.
- Moving between lessons with the footer or outline updates the video to the destination lesson without a blank/black stale iframe.
- Refreshing the lesson still works.
- A `?start=<seconds>` URL still starts from the requested position.
- Existing PostHog playback events remain available and are not duplicated by navigation.
- Type checking, linting, and a production build pass.

## Checks

1. Run `npx tsc --noEmit`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Start the app with `npm run dev`.

## Manual test steps

1. Open `/courses` and click a course, then click a lesson; verify the video thumbnail/player is visible on the first load.
2. Use the lesson outline or “Next Lesson”; verify the new lesson video appears without refreshing.
3. Refresh the lesson and verify the video still appears.
4. Open a lesson URL with `?start=30`; verify playback starts at the requested position.
5. In browser dev tools, verify there is only one active iframe/player for the current lesson and no console errors during transitions.
