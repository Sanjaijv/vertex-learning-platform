# Video transcript and chapter ingestion pipeline

## Goal

Build the `video` document schema (AGENTS.md section 8) and the offline ingestion pipeline (section 9) that populates one `video` document per unique lesson video: real YouTube chapters as the table of contents, and the real auto-generated transcript split into short timestamped chunks. Source videos from `studio/scripts/seed/videos.json` (120 entries, one per lesson) — do not modify that file or `seed.ndjson`. This task covers YouTube only; Vimeo/Bunny ingestion is out of scope until a lesson actually uses those providers (none currently do).

## Skills read

- `sanity-best-practices` → schema conventions (`defineField`/`defineType`, object arrays with `defineArrayMember`, `_id` conventions for documents you address directly by id).
- No dedicated skill covers video ingestion/scraping; this is offline tooling per AGENTS.md section 9, built to spec.

## Code inspected

- `studio/schemaTypes/documents/lesson.ts`: `videoUrl` is a required `url` field, already populated in `seed.ndjson` as `https://www.youtube.com/watch?v=<id>` — matches the `id` in `videos.json`.
- `studio/schemaTypes/index.ts`, `studio/structure.ts`: current schema only has `course`, `lesson`, `instructor`, `category`, `module`, `outcome`, `resource`. No `video` type yet, no reference to one exists anywhere in the schema (per AGENTS.md, lessons link to a video **by URL**, not by reference — I derive the video document's `_id` from the URL at query time, no schema change to `lesson`).
- `studio/scripts/seed/videos.json`: 120 entries keyed by lesson slug, each `{ id, title, channel, duration, query }` — `id` is the YouTube video id, already a valid Sanity `_id` fragment (alphanumeric + `-`/`_`).
- `studio/scripts/seed/seed.ndjson`: 141 documents, already imported (course/lesson/instructor/category). No `video` documents in it — this pipeline creates those separately, outside the ndjson seed.
- `studio/package.json`: standalone Studio workspace, scripts run via `sanity` CLI only today; no script runner for standalone TS scripts yet.
- Verified live against real YouTube pages (not assumption):
  - The watch page HTML embeds real chapter markers (`DESCRIPTION_CHAPTERS`) for videos that have them.
  - The unofficial `timedtext` endpoint called directly (with the signed URL scraped from the page) returns HTTP 200 but an empty body — YouTube now rejects it without a full player/PO-token session. Not usable directly.
  - `yt-dlp` (tested via a local `pip install`, confirmed working end to end against `9602Yzvd7ik`) fetches both auto-caption VTT and clean chapter JSON (`--dump-json` → `chapters: [{start_time, title, end_time}]`) reliably, because it does the full player-session/PO-token dance internally and is actively maintained against YouTube's changes.
  - `youtube-dl-exec` (npm, v3.1.13) is a promise-based Node wrapper that downloads a pinned `yt-dlp` binary on `npm install` — no ad hoc Python/pip step, no system dependency assumed, fits "offline tooling" run from `studio/`.

## Decisions and assumptions

1. **Use `youtube-dl-exec` (wraps `yt-dlp`), not a hand-rolled scraper or the raw `timedtext` endpoint.** The raw endpoint is confirmed dead without a browser session; `yt-dlp` is the standard, actively-maintained tool for exactly this and gives us both chapters and captions from one dependency. Added as a `studio` devDependency (offline tooling only, never imported by request-path code).
2. **Chapters come straight from `yt-dlp`'s `chapters` field.** These are YouTube's own creator/description-authored chapter markers — clean labels, matches AGENTS.md's "chapters first" requirement. `video.chapters[]` = `{ startSeconds: Math.round(start_time), label: title }`. If a video has zero chapters (some may), `chapters` is stored as an empty array — search then falls back to transcript-only matching for that video, per section 7.
3. **Chunks come from the English auto-caption track (`--write-auto-sub --sub-lang en --sub-format vtt`), re-chunked to ~20s windows.** Raw YouTube auto-caption VTT is "roll-up" style: each cue repeats the previous cue's text plus new words, so naively storing every cue would duplicate most of the transcript. The script parses the VTT, keeps only the newly-revealed words per cue (using the per-word `<c>` timing tags already present in the file), and re-groups that word stream into fixed ~20-second chunks (last chunk per video may be shorter). 20s is short enough to give the search agent a precise fallback timestamp (section 7's "noisier backstop") without exploding document size across 120 videos. If a video has no English auto-captions, `chunks` is stored as an empty array and the ingestion log flags it — chapter-only matching still works for that video.
4. **One `video` document per unique YouTube id, `_id` = `` `video.${youtubeId}` ``.** `videos.json` already has one entry per lesson with no id reused across lessons, so id collisions aren't a concern here, but the script still de-dupes by id defensively (matches "one per unique video URL" in section 8).
5. **Schema fields**, matching section 8 exactly plus the minimum extra needed to run/re-run ingestion safely:
   - `id` (string, required) — the provider video id.
   - `url` (url, required) — canonical `https://www.youtube.com/watch?v=<id>`.
   - `chapters[]` — object array, each `{ startSeconds: number, label: string }`.
   - `chunks[]` — object array, each `{ startSeconds: number, text: string }`.
   - No `provider` field: nothing in section 8 asks for one, and today every video is YouTube; adding one now would be speculative. Easy to add later without breaking anything.
   - `video` is **not** added to `studio/structure.ts`'s content list — section 7 says video documents are an internal lookup, never shown to the user as results, so authors shouldn't be encouraged to browse them as content. It stays reachable in the default Studio document list (needed for debugging) but isn't promoted in the curated structure.
6. **Script location and invocation**: `studio/scripts/ingest-videos.ts`, run with `npx tsx scripts/ingest-videos.ts` from `studio/` (added as `npm run ingest-videos`). Reads `SANITY_STUDIO_PROJECT_ID`/`SANITY_STUDIO_DATASET` from `studio/.env.local` (same convention `sanity.cli.ts` already uses) plus a new `SANITY_STUDIO_WRITE_TOKEN` (a write-scoped token — the read-only `SANITY_API_READ_TOKEN` used by the web app cannot write). Writes via `@sanity/client`'s `createOrReplace` per video document, one at a time, with a small delay between YouTube fetches to avoid rate-limiting 120 sequential requests. Logs a one-line summary per video (id, chapter count, chunk count, or a clear failure reason) and a final tally; does not fail the whole run on one video's failure — it collects failures and prints them at the end so a partial network hiccup doesn't waste the other 119.
7. **Not run in the request path**: confirmed nothing in `app/` or `sanity/lib/` will import this script; it's invoked manually/CI-only.

## Files to touch

- `studio/schemaTypes/documents/video.ts` — new, the `video` document type.
- `studio/schemaTypes/index.ts` — register `video` in the `types` array.
- `studio/scripts/ingest-videos.ts` — new, the ingestion script.
- `studio/package.json` — add `youtube-dl-exec`, `@sanity/client`, `tsx` (dev deps as needed) and an `"ingest-videos"` script.
- `studio/.env.example` — add `SANITY_STUDIO_WRITE_TOKEN` (server-only, offline-tooling use).
- `studio/.gitignore` — confirm it already ignores `.env.local` (check before assuming).

No changes to `studio/scripts/seed/videos.json`, `studio/scripts/seed/seed.ndjson`, `studio/schemaTypes/documents/lesson.ts`, or any web app code.

## Requirements

- Video documents are addressed by a predictable `_id` (`video.<youtubeId>`) so the search route can look one up directly from a lesson's `videoUrl` without a reference field or an extra query hop.
- Chapters are matched first, transcript chunks are the fallback — this task only has to produce the data; wiring that ranking logic into search is a separate task, but the shape must support it (`startSeconds` on both arrays, ordered ascending).
- Never store the whole transcript in one field — chunks stay short and timestamped, per section 9.
- Script must be idempotent: re-running it for an already-ingested video overwrites that video's document (`createOrReplace`) rather than duplicating or erroring.
- Script must handle a video with no chapters and/or no English auto-captions without crashing the whole run.

## Security considerations

- `SANITY_STUDIO_WRITE_TOKEN` is server/offline-only, lives in `studio/.env.local` (gitignored), never referenced from `app/` or any client bundle. `.env.example` documents it as server-only.
- The script only reads public YouTube metadata (chapters, auto-captions) for videos already chosen by the seed data — no scraping of arbitrary user-supplied URLs, no execution of untrusted input.

## Acceptance criteria

- `studio/schemaTypes/documents/video.ts` defines `id`, `url`, `chapters[]`, `chunks[]` as specified.
- Running `npm run ingest-videos` from `studio/` processes all 120 entries in `videos.json` and creates/updates a `video` document per entry in the `production` dataset.
- Spot-checked video documents contain real, correctly-ordered `startSeconds` chapters (matching what's visible on the actual YouTube video) and non-empty transcript chunks for videos that have English auto-captions.
- Re-running the script a second time doesn't error and doesn't create duplicates (same 120 `_id`s, content refreshed).
- `video` type does not appear as a browsable content type in `structure.ts`'s curated list.

## Checks to run

- In `studio/`: `npx tsc --noEmit` (or the equivalent typecheck script) after adding the schema and script.
- Run `npm run ingest-videos` for real against the live dataset (this is the actual verification — there's no meaningful unit test for a live YouTube scrape).
- Query counts after: `npx sanity documents query 'count(*[_type=="video"])' --dataset production` should read 120 (or fewer if any videos are genuinely unavailable — logged failures explain the gap).

## Manual test steps

1. `cd studio && npm install` (pulls in `youtube-dl-exec`, which downloads a pinned `yt-dlp` binary on install).
2. Add `SANITY_STUDIO_WRITE_TOKEN` to `studio/.env.local` (a write-token from sanity.io/manage for project `fp66jic8`).
3. `npm run ingest-videos` — watch the per-video log lines; confirm the final tally shows 120 processed (or a short, explained list of failures).
4. `npx sanity documents query 'count(*[_type=="video"])' --dataset production` → expect 120.
5. `npx sanity documents get video.9602Yzvd7ik --dataset production` (or open it in Studio's document list) — confirm `chapters` matches the real chapters on https://www.youtube.com/watch?v=9602Yzvd7ik, and `chunks` contains readable, deduplicated transcript text with ascending `startSeconds`.
6. Re-run `npm run ingest-videos` once more; confirm the count stays 120 and no duplicate/renamed documents appear.
