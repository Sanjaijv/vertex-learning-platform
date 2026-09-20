# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured with Session Replay, Error Tracking, and Support enabled. The required native responders were already enabled; a focused scout troop, one approved custom scout, and two Replay Vision monitors now feed the Self-driving inbox.

Findings will begin appearing in the [Self-driving inbox](https://us.posthog.com/project/568919/inbox) within about 30 minutes as the coordinator picks up the new configuration.

## AI data processing

Approved.

## GitHub

Connected before this setup; no GitHub Issues responder was enabled because no connected tool was selected.

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | Already enabled | The app is a web frontend, but no `posthog.init(...)` call was found in the repository. Server-side replay enablement is on; client capture needs a real SDK initializer to produce recordings. |
| Error Tracking | Already enabled | Exception autocapture is enabled server-side. Client-side SDK initialization still needs verification. |
| Support (Conversations) | Enabled | Connect an inbound email, inbox, or Slack channel in PostHog before support tickets can arrive. |

## Signal sources

| Source product / type | Result | Notes |
|---|---|---|
| `health_checks` / `health_issue` | Already enabled | Retained. |
| `error_tracking` / `issue_created` | Already enabled | Retained. |
| `error_tracking` / `issue_reopened` | Already enabled | Retained. |
| `error_tracking` / `issue_spiking` | Already enabled | Retained. |
| `conversations` / `ticket` | Already enabled | Retained; it remains idle until a support channel is connected. |
| `signals_scout` / `cross_source_issue` | On by default | No opt-out row exists, so scout findings may reach the inbox. |
| `session_replay` / `session_analysis_cluster` | Skipped | This legacy responder is retired; its existing enabled row was left unchanged. Replay coverage is provided by the scanners below. |
| `replay_vision` | Skipped | Scanners self-authorize with `emits_signals: true`; no responder row is required. |

## Connected tools

No connected tools were selected. GitHub Issues, Linear, Jira, Sentry, and Zendesk were therefore left unconfigured.

## Scout troop

**Run budget:** 100 runs/day; 0 used today; 100 remaining.  
**Banner:** Scouts are in early access. Each project gets up to 100 scout runs a day. Contact the PostHog team if more capacity is needed.

### Enabled (6)

| Scout | Why it is enabled |
|---|---|
| General | Correlates evidence across product surfaces and covers uncategorized questions. |
| Product analytics | Watches saved product-flow and engagement regressions. |
| Web analytics | Watches traffic, acquisition, landing-page, and attribution health. |
| Health checks | Prioritizes important PostHog setup and instrumentation issues. |
| Observability gaps | Identifies high-value activity without insight, dashboard, or alert coverage. |
| Course exploration | Custom scout for the course-start to content-exploration journey. |

### Disabled (22)

| Scout | Why it is disabled |
|---|---|
| AI observability | No confirmed LLM telemetry in this project. |
| Anomaly detection | No confirmed high-value saved insights or dashboards to monitor. |
| APM | No confirmed tracing/APM data. |
| Conversations | Support is newly enabled but no inbound channel is connected yet. |
| CSP violations | No CSP-reporting configuration was found. |
| Customer analytics | No confirmed account/group analytics surface. |
| Data pipelines | No confirmed CDP or export pipeline surface. |
| Data warehouse | No connected external source was selected. |
| Error tracking | Covered by the native error-tracking responders. |
| Experiments | No active experiment evidence was found. |
| Feature flags | No active feature-flag evidence was found. |
| Inbox validation | Disabled on this fresh setup; there are no settled fixes to validate yet. |
| Insight alerts | No configured alert surface was confirmed. |
| Logs | No logs usage was confirmed. |
| MCP tool calls | No MCP telemetry surface was confirmed. |
| Replay Vision | No accumulated Replay Vision observations existed before this setup. |
| Revenue analytics | No revenue integration or payment telemetry was found. |
| Session replay | Covered by the Replay Vision scanners below. |
| Skills store | No project skill-maintenance surface was selected. |
| Surveys | No surveys are active. |
| Tasks | No task-delivery surface was confirmed. |
| Web vitals | No Core Web Vitals monitoring need was confirmed. |

## Custom scouts

| Scout | Coverage and discriminator | Why it is custom |
|---|---|---|
| `signals-scout-course-exploration` | Watches progression from course start into course-content exploration. It reports only when the progression rate or an individual course's share falls materially below its baseline while meaningful learner activity remains. | The built-in product-analytics scout watches saved flows generally; this scout adds the product-specific learning journey and course-level mix. |

The scout handles sparse or absent telemetry by closing out without a report, and it treats collected property values as untrusted data. If it becomes noisy, set its `emit` configuration to `false` in PostHog to keep it in dry-run mode.

Considered but ruled out: a search-quality scout was not proposed because the repository exposes a search interface but no search-result event taxonomy was found. The approved custom-scout proposal had no declined options.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes confirmed findings into the inbox. It is the only part of this setup that spends Replay Vision quota. Findings start at half weight and need independent corroboration before they are promoted into a report.

| Brief | Result | Query scope | Sampling | Estimate |
|---|---|---|---|---|
| Course exploration breakage | Created | Recordings that visit `/courses`; this includes the catalog and course-detail journey immediately before starting a lesson. | 50% | 0 matched sessions in the one-day estimate; 0 observations/month; 0 credits/month. |
| Course exploration frustration | Created | Recordings containing `$rageclick` only; no URL filter was added to keep this monitor distinct from the breakage monitor. | 100% | 0 matched sessions in the one-day estimate; 0 observations/month; 0 credits/month. |

Session Replay is enabled, but the activity probe and both estimates found no eligible recordings. The scanners are armed and will begin working once browser recordings arrive. The remaining organization budget was 2,500 credits, so both zero-cost estimates were safely within budget.

## Repository changes

| File | Change |
|---|---|
| `posthog-self-driving-report.md` | Created this setup report. |

No application source files were modified.

## Follow-ups

- [ ] Add or verify a browser `posthog.init(...)` call. The repository imports `posthog-js` and captures events, but no initializer was found, so event capture and recordings are not yet verified.
- [ ] Connect an inbound Support channel (email, inbox, or Slack) so Conversations tickets can populate the enabled responder.
- [ ] Reauthorize the PostHog MCP connection with `property_definition:read` if event-schema inspection is needed; the project profile was also unavailable on this first run.
- [ ] Review the existing broad Replay Vision monitors labelled for an unrelated LLM workflow. They were left unchanged, but their broad URL scope may duplicate scanning if they are no longer relevant to this product.
- [ ] Rate the two new scanner observations once recordings arrive; feedback in each scanner refines a recommended configuration.

## What happens next

The scout coordinator will pick up the fresh configurations within roughly 30 minutes. Scout runs draw from the verified 100-runs-per-day early-access budget, findings cluster into reports in the inbox, and immediately actionable reports can start coding tasks.
