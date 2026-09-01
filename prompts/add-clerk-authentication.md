# Implementation prompt: Add Clerk authentication

## Goal

Wire up Clerk authentication in the Vertex web app: install and configure `@clerk/nextjs`, add the provider and middleware, and replace the current static avatar placeholder in the site header with real Clerk sign-in/sign-up/user controls, so a learner can create an account and be recognized across the site. This is infrastructure only — no protected routes, no progress tracking, no per-user data yet (those are separate, later pieces of work).

## Guidance inspected

- `AGENTS.md` sections 2 (workflow), 5 (auth is Clerk, wired through Next.js middleware, secret key server-only, publishable key client-safe, gate only what a feature marks private), 6 (tech stack includes Clerk), 7 ("Authentication is Clerk. Do not use Sanity's auth or roll your own. Keep browsing public and gate only what a feature marks as protected."), 12 (Clerk's secret key is server only; only the publishable key may reach the browser; protect private routes in middleware, not client code), 13 (checks to run).
- The `clerk-setup` skill (Clerk CLI quickstart flow): install/update CLI, `clerk auth login`, `clerk init --app app_3IYMc6PflVw07npOSLTp72Ed7AE` for an existing Next.js project, verify the proxy/middleware matcher includes `'/__clerk/:path*'` after the API/TRPC matcher, add visible sign-in/sign-up/signed-in controls, run `clerk doctor`, then manually test the flow.
- Current repo state: single Next.js 16 App Router project at the repo root (`package.json`, `app/`) — the Studio/web workspace split described in AGENTS.md section 5 has not been built yet, so Clerk setup targets this root app as "web" for now. No restructuring is in scope here.
- `app/layout.tsx`: root layout renders `<html><body>{children}</body></html>` with no providers yet — this is where `ClerkProvider` goes (inside `<body>`, per the setup skill's critical rules).
- `app/components/SiteHeader.tsx`: existing shared header with a static `<span className="avatar"><UserRound /></span>` placeholder and a notifications bell (bell stays presentational-only per AGENTS.md section 7 — out of scope). The avatar span is the natural slot for Clerk's signed-in/signed-out controls.
- No `middleware.ts`/`proxy.ts` exists yet — `clerk init` is expected to scaffold one.
- No `.env*` files exist yet — `clerk init` is expected to create `.env.local` with the publishable/secret keys; per the setup skill I will not read or print its contents.
- `clerk` CLI is already installed (v3.2.0) and this project is pre-linked to Clerk app `app_3IYMc6PflVw07npOSLTp72Ed7AE`.

## Decisions and assumptions

- Run the Clerk CLI flow against the repo root (existing Next.js project), not a fresh scaffold, since `app/` and `package.json` already exist.
- Use `clerk init --app app_3IYMc6PflVw07npOSLTp72Ed7AE` without `--framework`/`--pm` overrides, letting it auto-detect Next.js App Router + npm (there's a `package-lock.json`, no other lockfile).
- After `clerk init`, verify (not assume) that `middleware.ts`/`proxy.ts` matcher includes `'/__clerk/:path*'` right after the `'/(api|trpc)(.*)'` line; add it if the generated file is missing it.
- No routes are marked protected in this task. Per AGENTS.md section 7, "keep browsing public and gate only what a feature marks as protected" — there is no protected feature yet (My Learning, progress, etc. are future work), so middleware stays permissive (Clerk's default scaffolded matcher, no `auth.protect()` calls added).
- Replace the placeholder avatar in `SiteHeader.tsx` with Clerk's `Show`/`SignInButton`/`SignUpButton`/`UserButton` from `@clerk/nextjs`, keeping the bell icon untouched. Signed-out state shows sign-in/sign-up affordances in place of the current avatar icon; signed-in state shows `UserButton`. `SiteHeader` becomes a client component only if required by the Clerk components used (`Show`, `SignInButton`, etc. are client components) — will confirm against the installed `@clerk/nextjs` version's API during implementation and use whatever pattern that version documents.
- Do not touch `app/design-system/page.tsx` or any other page — this task only adds the provider, middleware, env, and the header controls.
- No `@clerk/ui`/shadcn theming — this project has no `components.json`, so that step is skipped.
- Update `.env.example` (create it if it doesn't exist) with the client-safe Clerk publishable key placeholder only; never write the secret key into any committed file.

## Expected files to touch

- `package.json` / `package-lock.json`: new `@clerk/nextjs` dependency (via `clerk init`).
- `app/layout.tsx`: wrap `{children}` in `<ClerkProvider>` inside `<body>`.
- `middleware.ts` (new, at repo root): `clerkMiddleware` with the verified matcher.
- `app/components/SiteHeader.tsx`: swap the static avatar placeholder for Clerk auth controls.
- `.env.local` (new, untracked — created by `clerk init`, not read/printed by me).
- `.env.example` (new or updated): add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` placeholder (and any other client-safe Clerk var `clerk init` wires in), per AGENTS.md's "keep a committed `.env.example` as the canonical list."

## Requirements

- `@clerk/nextjs` installed and `ClerkProvider` wraps the app inside `<body>`.
- Middleware present with `clerkMiddleware` and a matcher that includes `'/__clerk/:path*'` after the API/TRPC pattern, plus Clerk's standard static-asset exclusion.
- Header shows `SignInButton`/`SignUpButton` (or equivalent) when signed out, and `UserButton` when signed in, in the same visual slot the avatar placeholder currently occupies, matching the existing header layout/spacing (no restyle beyond swapping the placeholder for real controls).
- `CLERK_SECRET_KEY` never referenced outside server-only files (middleware/server config) and never imported into client components.
- No routes gated/protected in this pass.

## Security considerations

- Secret key stays server-only (middleware config), never imported client-side; only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` reaches the browser.
- `.env.local` stays untracked (already covered by `.gitignore` — will confirm); only `.env.example` with placeholders is committed.
- Do not print or read the contents of `.env.local` during or after setup.

## Acceptance criteria

- `clerk doctor` reports no issues.
- `npm run dev` starts cleanly with no Clerk-related console/runtime errors.
- Signed-out: header shows sign-in/sign-up controls; clicking them opens Clerk's auth flow.
- Signing up creates a user and the header updates to show `UserButton` without a full page reload issue.
- Signed-in: clicking `UserButton` shows account/sign-out options; signing out returns to the signed-out header state.
- Rest of the site (home page, design-system page) renders unchanged.

## Checks to run

- `npm run lint`
- `npx tsc --noEmit` (type check)
- `npm run build` (config/root layout/middleware changed)
- `clerk doctor`
- `npm run dev` + manual test steps below

## Manual test steps

1. Run `npm run dev`, open the site root.
2. Confirm the header shows sign-in/sign-up controls in place of the old placeholder avatar, with the bell icon unchanged.
3. Click sign-up, create a test account through Clerk's flow.
4. Confirm the header now shows a `UserButton`/avatar for the signed-in user.
5. Click the `UserButton`, confirm the account menu opens, then sign out.
6. Confirm the header reverts to signed-out controls.
7. Navigate to `/design-system` and confirm it still renders unaffected.
