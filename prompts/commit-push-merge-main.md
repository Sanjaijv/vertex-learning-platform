# Commit, push, and merge current work into main

## Goal

Commit the current work on `feat/video-ingestion-pipeline`, push that branch, merge it into `main` in `Sanjaijv/vertex-learning-platform`, and push `main`.

## Context inspected

- Read `AGENTS.md`, current Git status, branch graph, remotes, and the changed application files.
- Fetched `origin`: `origin/main` is at `8d9aaee` and already includes the current branch tip `0345c21` through PR #6.
- Current worktree contains PostHog instrumentation, course action tracking, generated PostHog skill files, and a PostHog setup report.
- No project skill is needed for Git operations; the request does not change Sanity, Clerk, or Next.js code.

## Decisions and assumptions

- Include all current tracked and untracked worktree changes in one commit because the request does not narrow the scope. Preserve existing files and content.
- Commit the prompt itself with the work so the required execution record is available in the repository.
- Merge the pushed feature branch into the latest remote `main` with a regular merge commit if Git requires one. Do not force-push or rewrite history.
- If new remote changes arrive, fetch and integrate them before pushing. Resolve only conflicts required for this merge.

## Expected files

- Existing modified files: `.gitignore`, `app/components/Bookmark.tsx`, `app/components/CourseContent.tsx`, `app/courses/[slug]/page.tsx`, `app/layout.tsx`, `package.json`, `package-lock.json`.
- New files: `.claude/skills/integration-nextjs-app-router/`, `.claude/skills/replay-vision-scanner-broken-experiences/`, `.claude/skills/replay-vision-scanner-user-frustration/`, `.claude/skills/replay-vision-scanners-core/`, `app/components/CourseStartLink.tsx`, `app/components/PostHogIdentity.tsx`, `instrumentation-client.ts`, `posthog-self-driving-report.md`, and this prompt.

## Requirements and security

- Verify staged changes contain no secrets or local environment files.
- Run `git diff --check`, web type check (`npx tsc --noEmit`), lint (`npm run lint`), and production build (`npm run build`) before pushing.
- Verify the feature branch and `main` both point to the intended commits on the remote, with a clean local worktree afterward.
- Keep the merge non-destructive and do not discard existing user changes.

## Acceptance criteria

- One commit contains the current worktree changes and this prompt.
- The feature branch is pushed to `origin`.
- `origin/main` contains the commit, and local `main` tracks it.
- All checks and any limitations are reported accurately.

## Manual test steps

1. Run `git status --short --branch` and confirm the worktree is clean.
2. Run `git log --oneline --graph --decorate -5` on `main` and confirm the feature commit is merged.
3. Run `git ls-remote origin refs/heads/main refs/heads/feat/video-ingestion-pipeline` and confirm remote refs match the local result.
