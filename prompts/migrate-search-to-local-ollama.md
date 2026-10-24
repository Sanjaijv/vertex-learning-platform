# Implementation Prompt: Migrate Vertex Search to Local Ollama

## Goal

Replace the search workflow's OpenAI cloud inference with the already-installed local
Ollama model `qwen2.5-coder:3b`, while preserving Sanity Context MCP discovery,
structured search-term validation, authoritative Sanity result retrieval, local ranking,
and the existing frontend response contract.

## Skills and guidance read

- Repository `AGENTS.md`, including server/client boundaries and validation requirements.
- The user-provided migration requirements in the attached task report.
- Installed AI SDK and provider package documentation/types in `node_modules`.

No Sanity schema, authentication, analytics, or UI skill is needed because this change is
limited to the server-side search model configuration and its environment documentation.

## Code inspected

- [`sanity/lib/search-context.ts`](../sanity/lib/search-context.ts): creates the Sanity
  Context MCP client, caches initial schema context, calls `generateText`, requires a
  `groq_query` tool call, and validates `{ terms: string[] }` with Zod.
- [`sanity/lib/search.ts`](../sanity/lib/search.ts): performs authoritative Sanity
  queries and local ranking after expansion.
- [`app/api/search/route.ts`](../app/api/search/route.ts): validates requests and maps
  failures to the existing 503 response.
- [`app/lib/search-types.ts`](../app/lib/search-types.ts): unchanged search response
  contract.
- [`package.json`](../package.json) and [`package-lock.json`](../package-lock.json):
  `ai@7`, `@ai-sdk/mcp`, and `@ai-sdk/openai@4` are installed.
- [`.env.example`](../.env.example) and [`README.md`](../README.md): currently document
  OpenAI configuration.

## Existing worktree constraints

The worktree already contains unrelated modifications in `app/globals.css`,
`app/search/search-results.tsx`, `prompts/video-ingestion-pipeline.md`,
`studio/scripts/ingest-videos.ts`, and an untracked existing prompt. Do not revert,
format, or alter those files.

## Decisions and assumptions

1. Prefer the installed `@ai-sdk/openai` provider in OpenAI-compatible mode rather than
   adding a second provider package. Configure a dedicated provider with a server-only
   `OLLAMA_BASE_URL` ending in `/v1`, a non-secret local compatibility key, and
   `OLLAMA_MODEL` defaulting to `qwen2.5-coder:3b`.
2. Do not use `OPENAI_BASE_URL` or any OpenAI cloud fallback. The provider must be
   constructed explicitly from the Ollama environment variables.
3. Keep the MCP connection, cached initial context, inline search rules, `stepCountIs(5)`,
   `Output.object`, Zod schema, required `groq_query` assertion, and MCP cleanup.
4. Verify the actual AI SDK request behavior against the running Ollama instance before
   finalizing. If the 3B model cannot satisfy tool calling or structured output through
   the compatible endpoint, make only a bounded server-side adaptation that still calls
   real MCP tools, validates tool names/arguments and final terms, and fails explicitly
   rather than fabricating results.
5. Keep error handling explicit and server-side. Ollama/MCP/model/structured-output
   failures must continue to surface as the existing search-unavailable response without
   leaking credentials or returning fallback guesses.

## Expected files to touch

- `sanity/lib/search-context.ts`: select the Ollama-backed model and add focused
  configuration/error handling only if runtime verification requires it.
- `.env.example`: replace OpenAI search settings with server-only Ollama settings.
- `README.md`: document local Ollama setup, startup commands, and that no OpenAI key is
  required.
- `package.json` and `package-lock.json`: change dependencies only if verification proves
  the installed provider cannot support the required flow.

## Requirements

- Use `OLLAMA_BASE_URL=http://127.0.0.1:11434` and
  `OLLAMA_MODEL=qwen2.5-coder:3b` as documented defaults.
- Keep all Ollama, Sanity, and Clerk secrets server-only.
- Do not download models, add a paid provider, expose arbitrary model/base URL choices,
  modify the browser API, or change result types/navigation.
- Preserve chapter-first video matching, transcript privacy, result ranking, and all
  existing loading/empty/error behavior.
- Bound model interaction using the existing five-step limit and avoid unnecessary calls.
- Log useful failure diagnostics without logging tokens or sensitive content.

## Security considerations

- The Ollama URL and model are read only by server code.
- The Sanity read token remains in MCP and Sanity server requests only.
- No automatic cloud fallback is permitted.
- User input remains constrained by the existing Zod request schema.
- Search results remain grounded in the authoritative Sanity query; model output is only
  expansion terms and is validated before use.

## Acceptance criteria

- `qwen2.5-coder:3b` is selected without an OpenAI cloud request.
- A live search request causes the local model to call the Sanity `groq_query` MCP tool,
  returns valid structured terms, and produces the existing `SearchResponse` shape.
- Stopping Ollama or using a missing model produces a clear server-side 503 path, not
  fabricated terms/results.
- Existing MCP authentication, initial-context caching, cleanup, and result ranking remain.
- `.env.example` and README no longer require `OPENAI_API_KEY`/`OPENAI_MODEL` for search.
- TypeScript, lint, and production build pass, or unrelated baseline failures are reported.

## Checks and manual verification

1. Confirm `ollama list` contains `qwen2.5-coder:3b`.
2. Confirm Ollama responds at `http://127.0.0.1:11434/api/tags`.
3. Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
4. Start the web app with the documented environment and POST
   `{"query":"data fetching"}` to `http://localhost:3000/api/search`.
5. Verify JSON matches `SearchResponse`, results link to `/lessons/<slug>` and
   `/lessons/<slug>?start=<seconds>`, and the browser receives no credentials.
6. Stop Ollama, repeat the request, and verify the existing explicit 503 error.
7. Inspect the final diff to ensure no unrelated worktree changes were modified.
