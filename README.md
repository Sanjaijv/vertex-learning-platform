# Vertex

Vertex is a Next.js learning site backed by a separate Sanity Studio. Search uses Sanity Context MCP and OpenAI on the server, then builds verified lesson and video cards from the private Sanity dataset.

## Local setup

1. Run `npm install` in the repo root and `studio/`.
2. Copy `.env.example` to `.env.local` and set the Clerk, Sanity Viewer, PostHog, and OpenAI values. Keep `SANITY_API_READ_TOKEN` and `OPENAI_API_KEY` on the server.
3. Copy `studio/.env.example` to `studio/.env.local`. Set its project, dataset, and `VERTEX_SANITY_WRITE_TOKEN` for offline import and ingestion scripts. This token name avoids the `SANITY_STUDIO_` prefix, whose values Sanity bundles into the Studio application.
4. Run `npm run dev` from the root. Open `/search?q=data%20fetching` or search from the home page.

## Search setup

Sanity Context requires a deployed Studio application and schema. In `studio/`, run `npm run deploy -- --yes --schema-required --url <your-studio-hostname>` and then `npm run import-search-context`. The import creates the `vertex-search` Context document if absent and preserves later edits. The MCP endpoint is built from the configured Sanity project and dataset; it uses the Context document's content filter and instructions.

Search requires `OPENAI_API_KEY`. `OPENAI_MODEL` defaults to `gpt-4.1-mini`. The `/api/search` route connects to Context MCP, asks the model to query course, lesson, and video data, then fetches authoritative Sanity projections. It returns only linked lesson cards and verified on-site video moments. The browser never sees Sanity or OpenAI credentials.

Editing the Context document's instructions takes effect on the next MCP request. The server caches the initial schema context; restart the web server after changing the Studio schema or inline prompt.

## Checks

From the root: `npx tsc --noEmit`, `npm run lint`, `npm run build`. From `studio/`: `npx tsc --noEmit`, `npm run build`.
