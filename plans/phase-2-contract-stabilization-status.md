# Phase 2 Contract Stabilization Status and Execution Plan

Contract stabilization is the only active Phase 2 delivery track. Units 1–2 are committed locally as feature-branch chains, but no branch has been pushed, assigned an upstream, opened as a PR, reviewed, merged, deployed, or shipped. Units 3–9 are planned and incomplete. Deferred product expansion remains in [Deferred Phase 2 Product Roadmap](deferred-phase-2-product-roadmap.md).

## Review path

1. Confirm the delivery boundary and accepted evidence below.
2. Review the superseding contract decisions and current blockers.
3. Execute Units 3–9 in dependency order; do not mix deferred product work into them.
4. Use the resilience acceptance ledger throughout implementation.
5. Pass the final stabilization gate before starting deferred product end-to-end work.

## Status at a glance

| Scope | Current state | Delivery truth |
|---|---|---|
| Committed intensive-study route and UI | Frontend tracker/base `f7f9e6f` | Local committed baseline; known lifecycle and contract defects remain |
| Unit 1: backend dependency baseline and partial-resume transaction | Backend B-00 `1c520b3` and B-01 `622da79`, based on tracker `9ef7e1f` | Committed locally; awaiting push, PR, review, and merge; not shipped |
| Unit 2: frontend transport/authentication stabilization | Frontend F-01–F-06, ending at `3167e72` | Committed locally; awaiting push, PR, review, and merge; not shipped |
| Units 3–9 | Defined below | Planned, incomplete, and not shipped |
| Deferred intraday, push, gamification validation, onboarding, i18n, and product E2E | Defined in the deferred roadmap | Deferred; not part of stabilization |
| Long-term generated/shared contract strategy | No decision | Deferred; no implementation commitment |

## Scope and non-goals

This document owns the executable stabilization plan for intensive-session and Pomodoro contracts: endpoint DTOs and parsers, state ownership, lifecycle capabilities, timers, reconciliation, route recovery, terminal responses, focused validation, and resilience evidence.

It does **not** authorize:

- intraday-review execution UI or routes;
- push notification behavior or service-worker integration;
- badge, streak, or gamification expansion;
- onboarding or translation completion;
- a generated/shared contract publication mechanism;
- broad endpoint, schema, response-envelope, error, persistence, or API normalization;
- claims that local commits, focused evidence, or an unpushed chain are merged, deployed, or shipped.

## Delivery boundary

### Committed feature baseline

The feature branch contains the protected `/intensive-study` route, `src/pages/IntensiveStudy.tsx`, `src/components/PomodoroTimer.tsx`, `src/components/IntensityPicker.tsx`, `src/components/SessionDifficultySelector.tsx`, `src/components/SessionResultsSummary.tsx`, `hooks/useIntensiveSessions.ts`, `hooks/usePomodoroTimer.ts`, and Phase 2 frontend types. This is useful implementation foundation, but it still uses legacy status values, mutable view state, unsafe response assumptions, relative timers, and only the base route.

### Unit 1 — local backend chain

Unit 1 is committed locally as B-01 `622da79` after the Prisma baseline B-00 `1c520b3`, both descending from backend tracker/base `9ef7e1f`. It isolates Pomodoro-start selection and activation in:

- `/mnt/d/OneStudySpace/services/intensiveStudyService.js`;
- `/mnt/d/OneStudySpace/services/intensivePomodoroStartService.js`;
- `/mnt/d/OneStudySpace/test/intensivePomodoroStartService.test.js`;
- `/mnt/d/OneStudySpace/package.json`.

Its 11/11 evidence covers the **Unit 1 partial-resume service/helper contract**, including deterministic interrupted-block recovery, fresh allocation isolation, duplicate/race handling, rollback, ownership of returned assignments, and counter preservation. It does not prove the full intensive HTTP flow. Prior observation #128 separately records real service/Prisma/PostgreSQL one-winner/one-conflict evidence and explains that the HTTP stack was not run because the unrelated native `sharp` load blocked startup in that environment.

### Unit 2 — local frontend chain

Unit 2 adds strict HTTP `2xx` semantics, retries only for response-less idempotent requests, auth-generation identity, exactly-once same-generation non-login `401` expiry handling, stale-generation rejection, degraded bootstrap, local intensive error normalization, and one-POST/authoritative-GET recovery for an ambiguous Pomodoro-start result. Its focused tests are under `src/features/intensive-study/api/`.

The frontend work is committed locally as F-01 through F-06. The final accepted focused evidence on F-06 is 4 files / 42 tests PASS, scoped TypeScript PASS, and Vite build PASS. These results do not establish Units 3–9, merge, deployment, or shipped status.

### Units 3–9

Units 3–9 are planned below. None is implemented or accepted merely because the page, hook, or compatibility mapping already exists.

## Authoritative contract decisions

| Area | Accepted contract |
|---|---|
| Session lifecycle | `CONFIGURING -> ACTIVE <-> PAUSED`, then `COMPLETED` or `ABANDONED` |
| Pomodoro lifecycle | `PENDING -> ACTIVE -> ON_BREAK -> COMPLETED`, with `ABANDONED` terminal; no Pomodoro `PAUSED` state |
| `CONFIGURING` | Created but not started; cards and pending blocks already exist; no configure mutation |
| Timer ownership | Backend timestamps/boundaries are authoritative; frontend derives display and sends explicit expiry actions |
| Acknowledgements | Pause, end-break, skip-break, and abandon results are not entities; authoritative GET reconciliation follows |
| Async ownership | A result may update state only for its captured user, route session, generation, request/command token, and target |
| Completion | Completion requires zero unfinished cards; `summary` and `nextReviews` are parsed without implementing deferred intraday execution |
| Abandonment | Both `ACTIVE` and `PAUSED` branches use abandon-info and lose 100% of accumulated session XP |

### Approved Unit 1 behavior superseding design #112

The approved Full-4R correction and current tests supersede the earlier design requirement that multiple interrupted blocks or an interrupted block with zero unfinished cards must fail immediately.

- Started `PENDING` blocks are recovered deterministically in block-number order.
- If the earliest interrupted block has unfinished owned assignments, that same block is activated and only those unfinished assignments are returned.
- If it has zero unfinished cards, the same block may be activated with `cards: []`; its original `totalCardsInBlock` and counters remain authoritative so the flow can reconcile and complete safely.
- Later interrupted blocks remain pending and are recovered in order.
- No recovery branch may steal, reassign, or consume future/unassigned cards.

Units 3–9 must parse and represent this behavior; they must not restore the superseded failure-only assumption.

### Prisma baseline

The backend Prisma CLI, client, adapter, and generated client are exactly **7.7.0**. Engram observation #151 records independent approval of that normalization. This is a dependency baseline fact, not a dependency-incident narrative and not evidence that Units 3–9 are complete.

### Local delivery chains

All entries below are local commits in feature-branch chains. Exact linear ancestry was verified; none has been pushed, assigned an upstream, opened as a PR, reviewed, merged, deployed, or shipped.

| Repository | Local chain | Delivery state |
|---|---|---|
| Backend | tracker/base `9ef7e1f` → B-00 `1c520b3` → B-01 `622da79` | Unit 1 and exact Prisma 7.7.0 baseline committed locally |
| Frontend | tracker/base `f7f9e6f` → F-01 `e0ffb13` → F-02 `1cc4c31` → F-03 `e446cd8` → F-04 `875beb7` → F-05 `e724218` → F-06 `3167e72` | Unit 2 committed locally; final accepted evidence belongs to F-06 |

Push and review each repository through its selected feature-branch-chain workflow before integration. The dirty source worktrees remain evidence/canonical-document locations, not delivery branches.

## Known blockers mapped to execution units

| Current blocker | Owning unit(s) | Required resolution |
|---|---|---|
| Pause is still reachable during `BREAK` through the fixed back control | Units 5 and 8 | Derive `canPause` from authoritative state and enforce it in both model and dispatcher/UI |
| End-break and skip-break immediately start another Pomodoro without authoritative GET | Units 3, 6, and 7 | Model acknowledgements separately; reconcile GET; permit a later start only from GET-confirmed `READY_FOR_BLOCK` |
| Only `/intensive-study` exists; session-ID route and all-phase recovery are missing | Unit 8 | Add `/intensive-study/:sessionId`, live-session discovery, owned detail load, and phase recovery |
| Complete/end/skip block operations do not prove that `blockId` belongs to URL `sessionId` | Unit 4 decision gate; Unit 9 final gate | Before acceptance, authorize a narrow backend ownership check with focused tests **or** explicitly amend the acceptance contract and record the residual risk; do not claim the invariant meanwhile |
| Frontend partial pause/resume does not authoritatively restart/recover the interrupted block | Units 5 and 7 | Preserve completed work, discard old timer, start the session, start/recover the same block, and expose only its unfinished assignments |
| Completion summary and `nextReviews` are discarded | Units 3, 6, and 8 | Parse, retain, and render stabilization-safe summary metadata without starting deferred intraday workflow |
| Pause, abandon, end-break, and skip-break responses are handled through unsafe entity-shaped assumptions/casts | Units 3, 6, and 7 | Use endpoint-specific acknowledgement/result types and reconcile entities through GET |
| Legacy frontend enums and broad `any` payloads remain | Unit 3 | Replace them at the wire/application boundary with canonical values and endpoint-specific parsers |
| Late command/GET/card results can overwrite another route or generation | Unit 4 | Add request tags, captured targets, reducer acceptance, generation invalidation, and stale-result rejection |
| Relative in-memory timers and auto-transitions do not survive reload/backgrounding safely | Unit 5 | Use absolute descriptors from `endsAt`, `breakEndsAt`, or authoritative timestamps; expiry exposes an action rather than inventing a server transition |
| Broad TypeScript fails and no focused script exists | Unit 9 | Add `tsconfig.intensive.json` and `typecheck:intensive`; keep the 46 pre-existing broad diagnostics outside the focused acceptance boundary |
| Full HTTP validation remains blocked on the recorded Windows/native `sharp` startup issue | Unit 9 final evidence | Run and record the full HTTP path in a viable environment; the accepted 11/11 service/helper suite is not a substitute |

## Units 3–9 execution plan

Execute these units in order. A unit may be split into smaller PRs where stated, but a later unit cannot claim acceptance while its prerequisite remains unintegrated.

### Unit 3 — Endpoint-specific wire contracts and parsers

| Field | Plan |
|---|---|
| Objective | Replace legacy status values, broad `any`, compatibility guesses, and acknowledgement-as-entity assumptions with endpoint-specific wire DTOs, parsers, and clients. |
| Prerequisites | Local backend chain through B-01 and frontend chain through F-06 pushed and reviewed as separate semantic slices; authoritative backend envelopes reconfirmed; approved Unit 1 supersession above accepted. |
| Deliverables/contracts | Canonical session/block/card statuses; create/list/detail/start/pause; Pomodoro start/complete/end/skip; card complete/next union; complete/abandon-info/abandon; omitted `activeBlock -> null`; nullable timestamps; opaque retained metadata; `cards: []` interrupted-block response support. |
| Likely file boundaries | Existing: `src/types/intensiveSessions.ts`, `hooks/useIntensiveSessions.ts`, `src/features/intensive-study/api/errors.ts`. Planned under the verified `src/features/intensive-study/api/` directory: `wire.ts`, `parsers.ts`, `client.ts`, and focused `*.test.ts` files. |
| Acceptance criteria | Every operation has its real request and response shape; parser inputs are `unknown`; no generic envelope is imposed; acknowledgements cannot hydrate entities; `cards/next` supports both card and `blockComplete` forms; summary/`nextReviews` parse without deferred execution; canonical statuses have no legacy aliases. |
| Focused tests/evidence | Parser fixtures for success, omitted/null fields, invalid identifiers/statuses, acknowledgements, cards-next union, completion metadata, and superseding empty-card resume behavior. Existing Unit 2 transport tests remain green. |
| Exact validation commands | `cd /mnt/d/frontOneStudySpace && npm run test:intensive -- src/features/intensive-study` and `cd /mnt/d/frontOneStudySpace && npm run build`. `npm run typecheck:intensive` is a required Unit 9 deliverable and does not exist yet. |
| PR/review boundary | Split into reviewer-sized session-wire and Pomodoro/card/terminal-wire PRs if either approaches 400 changed lines. No hook/UI migration, timer work, or deferred feature work. |

### Unit 4 — Async ownership and URL ownership decision

| Field | Plan |
|---|---|
| Objective | Prevent stale async results from mutating another user/route/session generation and close or explicitly disposition the URL `sessionId`/`blockId` ownership gap. |
| Prerequisites | Unit 3 typed results/parsers integrated. |
| Deliverables/contracts | `RequestTag`/`TaggedResult`; user, route session, generation, channel, request token, command token, and captured target checks; identity-change clearing; latest-request wins per channel; captured command URLs and follow-up GETs; explicit backend-scope decision for block ownership by URL session. |
| Likely file boundaries | Planned under verified `src/features/intensive-study/`: `model/ownership.ts` and focused tests. Existing integration boundaries: `hooks/useIntensiveSessions.ts`, `src/context/AuthContext.tsx`, `src/pages/GoogleCallback.tsx`. Ownership-gap evidence: `/mnt/d/OneStudySpace/controllers/intensiveStudyController.js`, `/mnt/d/OneStudySpace/services/intensiveStudyService.js`, `/mnt/d/OneStudySpace/test/intensivePomodoroStartService.test.js`. |
| Acceptance criteria | Late session-A command/GET/card results cannot change session B; out-of-order GETs cannot replace newer state; route/user change clears scoped transient state; in-flight commands keep captured A IDs; mismatched URL session/block commands are either rejected with unchanged state by an authorized narrow fix or the acceptance contract is explicitly amended before final gate. |
| Focused tests/evidence | Ownership reducer tests for stale route, auth generation, request token, command token, block/card target, identity clearing, captured IDs, and mismatch unchanged-state behavior. |
| Exact validation commands | Frontend: `cd /mnt/d/frontOneStudySpace && npm run test:intensive -- src/features/intensive-study`. If a narrow backend fix is authorized and covered by the existing focused suite: `cd /mnt/d/OneStudySpace && npm run test:intensive-pomodoro`. No new script is assumed. |
| PR/review boundary | Frontend ownership model is one PR under 400 changed lines. Any authorized backend ownership correction is a separate backend PR with explicit scope; do not mix it into frontend ownership work. |

### Unit 5 — Canonical phase/capability model and absolute timers

| Field | Plan |
|---|---|
| Objective | Derive lifecycle, command eligibility, timer state, expiry, and legacy recovery from authoritative snapshots instead of mutable page views. |
| Prerequisites | Units 3–4 typed contracts and ownership gate integrated. |
| Deliverables/contracts | Reducer/derived phases; command capabilities; `TimerDescriptor`; canonical `ON_BREAK`; `WORK_EXPIRED`/`BREAK_EXPIRED`; `INCONSISTENT`; exact `LEGACY_BREAK_RECOVERY`; pause and lifecycle mutual exclusion; no fabricated transition on expiry. |
| Likely file boundaries | Planned under verified `src/features/intensive-study/`: `model/state.ts`, `model/timer.ts`, and tests. Existing boundaries: `hooks/usePomodoroTimer.ts`, `src/components/PomodoroTimer.tsx`, `src/pages/IntensiveStudy.tsx`. |
| Acceptance criteria | `canPause` is false for authoritative `ON_BREAK`, expired break, legacy recovery, or conflicting command; timers reconstruct from absolute boundaries; paused/terminal/identity-changed states have no timer; legacy `PAUSED + ON_BREAK` exposes only the recovery action before GET confirms canonical state. |
| Focused tests/evidence | Pure reducer/capability/timer tests for every supported phase, invalid combinations, foreground/background clock changes, expiry without server transition, and live/elapsed legacy recovery. |
| Exact validation commands | `cd /mnt/d/frontOneStudySpace && npm run test:intensive -- src/features/intensive-study` and `cd /mnt/d/frontOneStudySpace && npm run build`. |
| PR/review boundary | Phase/capability and timer work may be separate reviewer-sized PRs. No endpoint mutation sequencing or page migration beyond test seams. |

### Unit 6 — Session and terminal orchestration migration

| Field | Plan |
|---|---|
| Objective | Migrate discovery/detail/create/start/pause/complete/abandon flows to owned commands and authoritative reconciliation. |
| Prerequisites | Units 3–5 integrated. |
| Deliverables/contracts | Captured targets; create-detail reconciliation; start metadata; pause acknowledgement then GET; complete summary/`nextReviews`; abandon-info; ACTIVE and PAUSED abandon; terminal reconciliation; ambiguous result recovery without mutation replay. |
| Likely file boundaries | `hooks/useIntensiveSessions.ts`, `src/pages/IntensiveStudy.tsx`, `src/components/SessionResultsSummary.tsx`, and focused tests under `src/features/intensive-study/`. |
| Acceptance criteria | Acknowledgements never become session entities; completion is not shown after a pending-card error; abandon does not cast `{xpLost,message}` as a session; terminal metadata is retained; stale results cannot navigate or replace current state. |
| Focused tests/evidence | Controller/hook tests for create/start/pause, duplicate-live-session unchanged state, pending-card completion unchanged state, summary parsing, both abandonment branches, 100% XP loss, and ambiguous terminal reconciliation. |
| Exact validation commands | `cd /mnt/d/frontOneStudySpace && npm run test:intensive -- src/features/intensive-study` and `cd /mnt/d/frontOneStudySpace && npm run build`. |
| PR/review boundary | One session/terminal command PR under 400 changed lines; split completion/abandon if required. No block/card migration or deferred intraday navigation. |

### Unit 7 — Block/card progression, partial resume, and break reconciliation

| Field | Plan |
|---|---|
| Objective | Migrate Pomodoro/card commands and implement the accepted partial-resume and legacy-break sequences without acknowledgement-driven or local transitions. |
| Prerequisites | Units 3–6 integrated; backend B-01 reviewed and merged before enabling corrected partial resume. |
| Deliverables/contracts | Pomodoro start/complete; card complete/next; same-block partial resume; completed-card exclusion; zero-unfinished interrupted block; end/skip acknowledgement then GET; legacy recovery start then owned GET; no automatic mutation replay; no Pomodoro start while `ON_BREAK`. |
| Likely file boundaries | `hooks/useIntensiveSessions.ts`, `hooks/usePomodoroTimer.ts`, `src/pages/IntensiveStudy.tsx`, `src/components/PomodoroTimer.tsx`, and focused tests under `src/features/intensive-study/`. |
| Acceptance criteria | Partial resume preserves block ID/counters/completed cards and returns only unfinished owned assignments; zero-card recovery remains safe; end/skip never starts the next block until GET proves readiness; legacy live/elapsed recovery issues only session start before reconciliation; conflicting block error preserves current phase/timer. |
| Focused tests/evidence | Partial-resume sequence, duplicate/ambiguous start, cards-next progression, end and skip branches, legacy recognition/live/elapsed/reload/error/race/pause-race/post-break gates, and unchanged state for block conflicts. |
| Exact validation commands | Frontend: `cd /mnt/d/frontOneStudySpace && npm run test:intensive -- src/features/intensive-study`. Unit 1 regression: `cd /mnt/d/OneStudySpace && npm run test:intensive-pomodoro`. Build each changed repository with its existing `npm run build` command when the PR is validated. |
| PR/review boundary | Split block/card migration from legacy recovery if either approaches 400 changed lines. No route/UI polish or deferred product flow. |

### Unit 8 — Session route, reload recovery, controls, and terminal UI

| Field | Plan |
|---|---|
| Objective | Make route identity authoritative and render every recovered phase and command capability without an independent lifecycle view. |
| Prerequisites | Units 3–7 integrated. |
| Deliverables/contracts | Protected `/intensive-study/:sessionId`; base-route discovery for `CONFIGURING`/`ACTIVE`/`PAUSED`; owned detail load; all-phase reload recovery; pause/end/skip/start controls from capabilities; legacy recovery action; error gates; completion summary and deferred metadata display boundary. |
| Likely file boundaries | `src/App.tsx`, `src/pages/IntensiveStudy.tsx`, `src/components/PomodoroTimer.tsx`, `src/components/SessionResultsSummary.tsx`, `src/components/IntensityPicker.tsx`, `src/components/SessionDifficultySelector.tsx`, `hooks/useIntensiveSessions.ts`, and focused tests under `src/features/intensive-study/`. |
| Acceptance criteria | Positive route IDs load detail; base route discovers the one live session; failed GET never shows false creation; reload reconstructs every ledger phase; pause is unavailable during breaks; results distinguish completion from abandonment; no intraday route/UI is added. |
| Focused tests/evidence | Route/discovery/reload tests; controls by capability; all three error messages; completion/abandon rendering; stale route results; no card fetch/start in break, paused, configuring, legacy, or terminal recovery. |
| Exact validation commands | `cd /mnt/d/frontOneStudySpace && npm run test:intensive -- src/features/intensive-study` and `cd /mnt/d/frontOneStudySpace && npm run build`. |
| PR/review boundary | Split routing/recovery UI from progression/terminal UI where needed to keep each semantic review below 400 changed lines. No deferred intraday, push, or gamification work. |

### Unit 9 — Focused validation and stabilization evidence

| Field | Plan |
|---|---|
| Objective | Make contract drift reproducibly detectable and close the complete stabilization ledger before deferred product work. |
| Prerequisites | Units 3–8 integrated; URL session/block ownership decision resolved; branch reconciled through the repository's normal workflow. |
| Deliverables/contracts | `tsconfig.intensive.json`; package script `typecheck:intensive`; focused Vitest coverage; frontend/backend builds; resilience ledger evidence; sanitized metadata and artifacts; backend-freeze/semantic diff review. |
| Likely file boundaries | `tsconfig.intensive.json` (required new file), `package.json`, `src/features/intensive-study/**/*.test.ts`, and this plan's evidence ledger. Backend evidence remains bounded to `/mnt/d/OneStudySpace/package.json`, `/mnt/d/OneStudySpace/test/intensivePomodoroStartService.test.js`, and any separately authorized URL-ownership test/change. |
| Acceptance criteria | Focused TypeScript includes root hooks, page/components, auth lifecycle call sites, and feature modules; all focused tests and builds pass; every resilience row has evidence; commands and metadata are reproducible; no deferred product scope is required. |
| Focused tests/evidence | Full focused frontend suite, Unit 1 backend suite, manual/API-assisted resilience matrix, prior/updated PostgreSQL evidence where explicitly authorized, and semantic diff review. There is no configured automated product E2E runner. |
| Exact validation commands | Required after the script is created: `cd /mnt/d/frontOneStudySpace && npm run typecheck:intensive`; existing: `cd /mnt/d/frontOneStudySpace && npm run test:intensive`, `cd /mnt/d/frontOneStudySpace && npm run build`, `cd /mnt/d/OneStudySpace && npm run test:intensive-pomodoro`, `cd /mnt/d/OneStudySpace && npm run build`, and `cd /mnt/d/OneStudySpace && node --check services/intensivePomodoroStartService.js && node --check services/intensiveStudyService.js && node --check test/intensivePomodoroStartService.test.js`. |
| PR/review boundary | Validation/config/evidence-only stabilization PR, target under 300 changed lines excluding separately reviewed generated lockfile changes. `typecheck:intensive` is a required deliverable until it exists; do not claim it as currently runnable. |

## Stabilization resilience acceptance ledger

Every row is required for stabilization. “Unchanged” means the authoritative pre-command lifecycle, assignments, counters, timer ownership, and unrelated route/session state remain unchanged unless the row explicitly names a valid transition.

### Core journey and terminal branches

| ID | Scenario | Required result and unchanged-state expectation | Owning unit(s) | Evidence required |
|---|---|---|---|---|
| R-01 | Create | 201; `CONFIGURING`; estimates retained; generated blocks/cards obtained through GET; no configure mutation | 3, 6, 8 | Parser + controller/UI test; sanitized POST/GET evidence |
| R-02 | Start | `CONFIGURING` or `PAUSED` becomes `ACTIVE`; multiplier, `xpPotential`, applied multipliers, and streak remain parseable | 3, 6 | Parser/orchestration test; sanitized response |
| R-03 | Start active block | One `ACTIVE` block, assigned cards, `endsAt`, and one client timer; no duplicate assignment | 3, 7 | Parser/progression test; request/GET evidence |
| R-04 | Active cards | Complete each card with `EASY`/`MEDIUM`/`HARD`; retain XP/review metadata; `cards/next` remains within the active block until `blockComplete` | 3, 7 | Union/parser and progression tests |
| R-05 | Enter break | Block completion produces `ON_BREAK`, `breakEndsAt`, duration, and XP; pause becomes unavailable | 3, 5, 7, 8 | State/capability + progression tests |
| R-06 | End break | Acknowledgement is followed by GET; only GET-confirmed `COMPLETED` permits later next-block start | 3, 7 | Sequence test proving no immediate start |
| R-07 | Skip break | Same reconciliation rule as end-break; no entity is fabricated from acknowledgement | 3, 7 | Independent skip sequence test |
| R-08 | Repeat | R-03 through R-07 repeat until no pending block/card remains; no block is skipped or started twice | 7, 8, 9 | Full manual/API-assisted ledger |
| R-09 | Complete | Only zero-pending-card `ACTIVE` session completes; `summary` and `nextReviews` are retained; no intraday execution starts | 3, 6, 8 | Terminal parser/UI test + sanitized response |
| R-10 | Abandon from `ACTIVE` | Abandon-info is shown; result records 100% accumulated XP loss; GET/list reconcile `ABANDONED` | 3, 6, 8 | Branch test + sanitized evidence |
| R-11 | Abandon from `PAUSED` | Same as R-10 from ordinary `PAUSED`; no resume is required | 3, 6, 8 | Separate branch test + sanitized evidence |

### Reload and recovery at every phase

| ID | Reload point | Required authoritative reconstruction | Owning unit(s) | Evidence required |
|---|---|---|---|---|
| R-12 | After create, before start | `CONFIGURING`, pending blocks, no timer, no configure mutation | 5, 8 | Cold-route reload test/evidence |
| R-13 | `ACTIVE`, before a block | No active block; `READY_FOR_BLOCK`; no card fetch or automatic start | 5, 8 | Reload test/evidence |
| R-14 | Active work | Same `ACTIVE` block; work deadline from GET timestamp/duration; assigned-card progress retained | 5, 7, 8 | Reload/timer/card evidence |
| R-15 | Between cards | Completed cards remain complete; next card comes from `cards/next`; no prior card resurfaces | 7, 8 | Reload/progression evidence |
| R-16 | `ON_BREAK` | Same block and break deadline; pause disabled; explicit end/skip enabled; no work timer | 5, 7, 8 | Live and expired break reload tests |
| R-17 | After end/skip | GET supplies completed block and any next pending block; acknowledgement alone creates neither | 7, 8 | Post-break reload evidence |
| R-18 | Ordinary `PAUSED` | Former work timer discarded; interrupted block represented as `PENDING`; completed work retained | 5, 7, 8 | Paused reload evidence |
| R-19 | Pre-completion | Remaining-card count and block statuses govern whether complete is enabled | 5, 6, 8 | Capability/reload evidence |
| R-20 | `COMPLETED` | Terminal state and summary boundary; no timer or lifecycle command restarts | 5, 8 | Terminal reload evidence |
| R-21 | `ABANDONED` | Terminal state; no timer or lifecycle command restarts | 5, 8 | Terminal reload evidence |

### Resilience, compatibility, errors, and ownership

| ID | Scenario | Required result and unchanged-state expectation | Owning unit(s) | Evidence required |
|---|---|---|---|---|
| R-22 | Partial pause/resume | Pause partial work, GET `PAUSED` + same `PENDING` block, preserve completed cards/counters, discard old deadline, resume/start same block, expose only unfinished owned cards | 5, 7, 9 | Backend Unit 1 evidence + frontend sequence + sanitized IDs/counters |
| R-23 | Multiple interrupted blocks | Recover started pending blocks deterministically by block number; later candidates remain untouched until their turn | 3, 7, 9 | Unit 1 focused test + frontend parser/progression evidence |
| R-24 | Zero unfinished cards | Activate/reconcile the earliest interrupted block with `cards: []` and original counters; consume no future/unassigned card | 3, 7, 9 | Unit 1 focused test + frontend empty-card flow |
| R-25 | Legacy `PAUSED + ON_BREAK` | Derive recovery-only phase; issue only session start, then owned GET; confirm same `ACTIVE + ON_BREAK`; explicit end/skip; never call Pomodoro start while break remains authoritative | 5, 7, 8 | Live, elapsed, reload, error, ambiguous, race, and post-break tests |
| R-26 | Duplicate live-session error gate | Show `Ya tienes una sesión activa`; existing live session and route state remain unchanged | 3, 6, 8 | Production-path error + UI state assertion |
| R-27 | Pending-card completion error gate | Show exact pending count; session remains active; no summary/terminal navigation | 3, 6, 8 | Production-path error + UI state assertion |
| R-28 | Conflicting block error gate | Show active/break conflict; no second block, timer, assignment, or local phase | 3, 7, 8 | Production-path error + unchanged-state assertion |
| R-29 | Ambiguous mutating POST outcome | Never auto-replay; authoritative GET for captured identity determines outcome; unresolved GET leaves retryable, non-success state | 2, 4, 6, 7 | One-POST/one-GET tests per mutation family |
| R-30 | Stale async ownership | Late session-A command/GET/card/error cannot alter session B state, timer, error, or navigation | 4, 6, 7, 8 | Ownership and route-race tests |
| R-31 | Auth expiry generation | Concurrent non-login `401`s expire one generation exactly once; login/reset creates a new generation; stale old `401` cannot clear new credentials; later generation may expire once | 2, 4, 9 | Existing auth-generation suite retained |
| R-32 | Degraded bootstrap | Network/timeout/5xx preserves credentials and exposes retry; authoritative profile `401` invalidates | 2, 8, 9 | Existing provider tests plus rendering/smoke evidence |
| R-33 | URL session/block ownership | `blockId` must belong to URL `sessionId`; a mismatch must be dispositioned before acceptance and must never silently mutate another session's block | 4, 9 | Authorized backend test/fix or explicit amended contract with residual risk |
| R-34 | Completion metadata | All summary counters and `nextReviews` are parseable and reviewable; deferred intraday navigation/execution remains absent | 3, 6, 8 | Parser + summary rendering tests |
| R-35 | Expired work/break with unchanged backend state | Client exposes actionable expired phase while GET still says `ACTIVE`/`ON_BREAK`; no server transition is fabricated | 5, 7, 8 | Timer/capability and API-assisted evidence |

## Validation evidence — accepted, not freshly executed here

| Evidence | Repository / branch / HEAD | Command and result | Scope and delivery boundary | Artifact reference |
|---|---|---|---|---|
| Unit 1 focused service contract | Backend B-01 `622da797702ea8c4a0ba2a17f676785d0d1b371d` | `npm run test:intensive-pomodoro` — 11/11 accepted PASS | Service/helper partial-resume scope only; not the full HTTP/backend flow; not rerun for this document | Observations #114, #122, #128, #149 |
| Unit 1 syntax | Same B-01 commit | `node --check services/intensivePomodoroStartService.js && node --check services/intensiveStudyService.js && node --check test/intensivePomodoroStartService.test.js` — accepted PASS | Unit 1 files only; not rerun for this document | Observations #128, #149 |
| Real PostgreSQL concurrency | Backend B-01 lineage; disposable fixture | Prior service + Prisma/PostgreSQL one-winner/one-conflict PASS with cleanup | Service/transaction persistence evidence; HTTP stack excluded; not rerun for this document | Observation #128 |
| Unit 2 final focused frontend | Frontend F-06 `3167e72414971984dd6c6b67338bb8a4bd2c5135` | `npm run test:intensive -- src/features/intensive-study/api/transport.test.ts src/features/intensive-study/api/authExpiry.test.ts src/features/intensive-study/api/authBootstrap.test.ts src/features/intensive-study/api/intensiveHook.test.ts` — 4 files / 42 tests accepted PASS | F-01–F-06 transport/auth/intensive scope; not Units 3–9; not rerun for this document | Observation #183 |
| Scoped frontend TypeScript | Same F-06 commit | Accepted scoped TypeScript PASS | Existing F-01–F-06 changed-file acceptance scope; not `typecheck:intensive`; not rerun for this document | Observation #183 |
| Frontend production build | Same F-06 commit | `npm run build` — accepted Vite PASS (3,035 modules) | Production bundle validation; not deployment; not rerun for this document | Observation #183 |
| Broad frontend TypeScript | Same F-06 commit | `./node_modules/.bin/tsc -p tsconfig.json --noEmit --pretty false` — non-gating FAIL with 46 pre-existing diagnostics | Broad repository debt remains red; not a stabilization pass | Observation #183 |
| Focused Unit 9 TypeScript command | Same F-06 commit | `npm run typecheck:intensive` — unavailable; `typecheck:intensive` and `tsconfig.intensive.json` do not exist | Required Unit 9 deliverables; no current pass is claimed | Observation #183 |
| Prisma normalization | Backend B-00 `1c520b33d9089348e0fd8ae2a7b182a4cdbaf395` and B-01 descendant | CLI/client/adapter/generated client exactly 7.7.0 | Committed local dependency baseline only | Observations #151, #160 |

Evidence dates were not supplied in the accepted observation export. Unit 9 must record an actual timestamp for each final run rather than infer one here.

## Final stabilization acceptance gate

This gate is stabilization-only and must pass before the deferred roadmap's product end-to-end work starts. It does not require intraday UI, push integration, gamification expansion, onboarding, or translation completion.

### Gate checklist

- [ ] Local backend B-00/B-01 and frontend F-01–F-06 chains are pushed, reviewed, and integrated; Units 3–9 are then completed and integrated.
- [ ] The Unit 4 URL `sessionId`/`blockId` ownership decision is implemented and tested, or the acceptance contract is explicitly amended with a recorded residual risk.
- [ ] `tsconfig.intensive.json` exists and includes root contract-bearing hooks, intensive page/components, auth lifecycle call sites, and feature modules without absorbing unrelated broad diagnostics.
- [ ] `typecheck:intensive` exists in `package.json` and passes.
- [ ] Focused frontend tests pass, including all ledger rows with automated coverage.
- [ ] Frontend production build passes.
- [ ] Unit 1 backend focused tests, syntax checks, and backend build pass within their declared scope.
- [ ] The full manual/API-assisted resilience ledger R-01–R-35 is complete; unavailable automated product E2E is not invented.
- [ ] Backend-freeze and frontend semantic diffs contain no deferred product scope or unrelated cleanup.
- [ ] Every evidence record contains repository, branch, full HEAD, UTC timestamp, exact command, result, scope, committed/uncommitted status, and artifact link/path.

### Required final commands

```bash
cd /mnt/d/frontOneStudySpace && npm run typecheck:intensive
cd /mnt/d/frontOneStudySpace && npm run test:intensive
cd /mnt/d/frontOneStudySpace && npm run build
cd /mnt/d/OneStudySpace && npm run test:intensive-pomodoro
cd /mnt/d/OneStudySpace && npm run build
cd /mnt/d/OneStudySpace && node --check services/intensivePomodoroStartService.js && node --check services/intensiveStudyService.js && node --check test/intensivePomodoroStartService.test.js
```

`npm run typecheck:intensive` is intentionally listed as a required deliverable and final command even though it does not exist today. Unit 9 creates it; no current pass is implied.

### Evidence record template

| Field | Required value |
|---|---|
| Repository | Absolute repository root |
| Branch | Exact branch at execution |
| HEAD | Full commit SHA |
| Timestamp | UTC ISO-8601 |
| Command | Exact command, including path filters |
| Result | Exit code and test/build/typecheck counts or concise failure |
| Scope | Unit(s), scenarios, and exclusions |
| Delivery state | Committed, uncommitted working tree, or deployed |
| Artifact | Sanitized log, report, screenshot/recording, or API ledger path/link |

## Integration checklist before Unit 3

- [ ] Push the local backend tracker/B-00/B-01 and frontend tracker/F-01–F-06 chains without changing their verified ancestry.
- [ ] Open and review Unit 1 and Unit 2 as separate semantic delivery slices; local passing evidence is not merge or shipped status.
- [ ] Reconcile each repository chain through its normal review/merge workflow and recheck assumptions against the actual target branch.
- [ ] Keep backend B-01 isolated and deploy it before enabling corrected frontend partial resume.
- [ ] Accept the approved multiple-interrupted/zero-unfinished supersession recorded above.
- [ ] Record the Unit 4 URL ownership decision owner and review boundary.
- [ ] Preserve Prisma 7.7.0 exactly unless a separate dependency decision authorizes change.
- [ ] Start Unit 3 with tests for wire behavior; do not begin deferred roadmap work.

## Next review action

Push and open the local backend chain through B-01 and frontend chain through F-06 for review, preserving their feature-branch boundaries and narrow accepted evidence. After both chains are reviewed and integrated, begin Unit 3 with the session-wire parser tests. Do not claim full stabilization until Units 3–9 and the final gate pass.
