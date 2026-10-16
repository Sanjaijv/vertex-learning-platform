# Implement intelligent search

## Goal

Connect Vertex's private Sanity dataset to Sanity Context MCP and an OpenAI powered server search route. Build `/search` to show ranked, grounded video moments and lesson results for a plain language query. Match `design/vertex-search.png` on desktop and adapt it for mobile. The home page's existing search form should land on this page.

## Guidance read

- `AGENTS.md`: search contract, security boundaries, UI reference, approval and checks.
- `create-agent-with-sanity-context`: HTTP MCP connection, initial context, tool discovery, deployed Studio prerequisite.
- `dial-your-context`: keep Context instructions to verified query deltas and scope visible document types.
- `shape-your-agent`: keep the inline system prompt short, grounded, and explicit about unknowns; this project's rules require critical query guidance in both places.
- `sanity-best-practices` GROQ guide: parameterized queries, projections, reverse references, and TypeGen.
- Installed Next.js 16.3.3 docs for App Router route handlers and server/client boundaries.

## Code inspected

- Root Next.js app in `app/`, standalone `studio/`, both package manifests and lockfiles, `.env.example`, `proxy.ts`.
- `sanity/lib/{client,fetch,queries,data}.ts`, `sanity/env.ts`, generated `sanity.types.ts`.
- Studio course, lesson, video schemas; Studio config/structure; existing video ingestion script.
- Home page search form, shared header/styles, lesson page and YouTube embed helper.
- `design/vertex-search.png`.
- Working tree is dirty with an in-progress lesson page and related edits. Preserve those changes.

## Decisions and assumptions

- Public browsing remains public. `/search` and its read-only API require no sign-in.
- The web route uses a server-only Sanity read token for Context MCP and the private dataset. The browser receives only projected card fields.
- Use the Sanity Context document slug `vertex-search`, with a content filter for published `course`, `lesson`, `video`, `instructor`, and `category` documents. The `video` type is internal to MCP queries and never a top-level result.
- Do not install `@sanity/context` if its peer dependency excludes Studio's Sanity 5. Create/import the `sanity.agentContext` document with offline Studio tooling if credentials are available, and keep a reproducible config file in the repo.
- Use AI SDK OpenAI provider and MCP tools server side. Fetch `/initial-context` and cache it in the server process. Validate LLM structured output with Zod. The model may discover matching content, but returned IDs, paths, labels, course membership, and seconds are verified against authoritative Sanity projections before reaching the browser.
- Search matches lesson title and Portable Text plain-text projection, video chapters first, then filtered transcript chunks. Use wildcarded tokens with OR, not a full phrase pattern. Rank exact concept titles above broader matches. Merge both result kinds and do not impose an arbitrary small result limit. A lesson may appear once as a lesson and at relevant video moments as video cards; deduplicate repeated moments.
- A video's match is valid only when its URL belongs to a returned lesson. Only YouTube video moments are clickable until other providers have ingestion and seeking support; existing playback is YouTube only.
- Result descriptions and counts derive from stored content or filtered snippets. Do not fabricate text, course data, timestamps, or counts.
- The search API may return JSON after server-side generation; present a loading state on the client results page. The UI is cards, not a chat interface. The sort control starts at Most Relevant and may offer course/title sorting client side.
- If no query is supplied, show the search form with a prompt to search. No matches show a catalog link. Configuration or upstream failures show a visible retry state, not a false zero result.

## Files expected to change

- Root `package.json`, `package-lock.json`, `.env.example` for AI SDK, OpenAI provider, Zod, and server-only config variables.
- `app/api/search/route.ts`, `app/search/page.tsx`, client results component(s), `app/globals.css`, perhaps `app/components/SiteHeader.tsx` if navigation requires it.
- `sanity/lib/search.ts` and supporting server-only Context/validation/query modules; `sanity/lib/queries.ts` if shared projections help.
- `studio/scripts/` for an importable Context config document and its source data; Studio package script only if useful.
- `README.md` for env and deployment/setup steps if existing instructions need updating.
- Generated `sanity.types.ts` only if TypeGen is needed by new GROQ queries. Do not reset the pre-existing changes.

## Requirements

1. Build MCP URL from configured project, dataset, and `vertex-search` slug. Authenticate with a Viewer token; never leak the token, model key, raw MCP payload, transcript arrays, or query text to the browser.
2. Fetch initial context once per server process and refresh only after restart. Close MCP clients after requests. Handle missing env and upstream errors explicitly.
3. The inline prompt and Context document both enforce token wildcard OR matching, Portable Text plain text, chapter-first then transcript fallback, exact-title priority, reverse course lookup, and grounded output.
4. Retrieve all relevant candidate lesson and video matches for the query, validate and rank them, and form typed cards from Sanity fields. Return actual result and distinct-course counts.
5. Video cards include course, module and derived lesson number, poster, duration, short stored/snippet description, timestamp, and `/lessons/<slug>?start=<seconds>` link. Lesson cards include course, module, derived lesson number, key points, stored description, and `/lessons/<slug>` link.
6. Search page matches the reference's header, title/count, large input, sort control, video and lesson card variants, and catalog callout. Make layouts stack and remain usable on small screens. Maintain keyboard labels and focus visibility.
7. Record a `search_performed` PostHog event with query and result count using the existing browser analytics setup, without adding private analytics keys.
8. Preserve unrelated in-progress edits. No custom player, access gating, or new backend framework.

## Security considerations

- Validate and cap query length, trim whitespace, reject malformed requests, and use parameters for all authored GROQ values.
- Reject or discard model-supplied URLs, IDs, timestamps, and card data that cannot be joined to published Sanity records. Clamp seconds to the actual lesson duration.
- Return generic server errors to clients; avoid logging secrets or complete transcript text.
- Restrict MCP scope with the Context filter, and keep secrets in server-only modules and `.env.local`.

## Acceptance criteria

- Plain English queries return relevant ranked video and lesson cards grounded in actual published courses and lessons.
- A video card seeks to the matched second on Vertex's lesson page. A lesson card opens the lesson page.
- The count equals the returned cards; course count equals distinct linked courses; sort works; empty and error states differ.
- The private dataset, MCP and LLM are reached only through the server. The Context config can be edited independently of code and applies on the next request.
- Search layout follows the supplied desktop design and works on mobile.

## Checks to run

- `npx tsc --noEmit`, `npm run lint`, `npm run build`, then start `npm run dev` and request `/search` and `/api/search`.
- In `studio/`: build/typegen if files change, deploy Studio app, deploy schema, import Context config if credentials and CLI access permit.
- Test Context `/initial-context` and tool discovery, then run live searches against the MCP endpoint with a known chapter term, a lesson-only term, and an absent term. Verify data and seek links.
- Report exact outcomes, including any network, credential, Studio deployment, or live MCP limitation.

## Manual test steps

1. Set the `.env.example` variables in `.env.local`, including Sanity Viewer token and OpenAI key. Start the web dev server.
2. Search from the home hero for a known topic such as `data fetching`; confirm the full results page, counts, relevance order, and both card kinds.
3. Open a video result; confirm its lesson URL has `start` and the on-site YouTube embed begins near that second.
4. Open a lesson result; confirm it opens the matching lesson without a start override.
5. Change the sort option and search again using the page input; confirm cards update and links remain valid.
6. Search nonsense text; confirm the empty state and catalog link. Remove the model key temporarily; confirm an error state rather than `0 results`.
7. Resize to a narrow viewport and use the search and sort controls with keyboard navigation.
