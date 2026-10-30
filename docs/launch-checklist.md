# FOODIE — Launch Checklist (this session)

Tracked checklist of real launch blockers. Established at session start from
read-only inspection; updated as items resolve. Never assume — every value
below was measured on 2026-10-27 against the working tree and live systems.

## Measured starting state

| Item | Value | How measured |
| --- | --- | --- |
| Git HEAD | `47103a0` (Tirupati batch-6), parent `15644aa` | `git rev-parse HEAD` |
| Batch-5 commit in history | `01b0937` ✓ | `git log --oneline` |
| origin/main | `8cb0a37` — local ahead 11, behind 0 | `git rev-list --left-right --count` |
| Working tree | clean (no modified / untracked) | `git status --short` |
| Tests | 170/170 pass | `bun test tests/` |
| Dev server | HTTP 200 on :3000 | curl |
| Production homepage | HTTP 200 | curl |
| Production API | 86 rows (80 Doddaballapura + 6 Tirupati) | GET /api/restaurants/all |
| Production `restaurants` table | 86 rows | Supabase REST count=exact |
| Production `places` table | 0 rows (schema exists) | Supabase REST count=exact |
| Production `destinations` | 3 rows; `destination_foods` 5 rows | Supabase REST count=exact |
| Production `push_subscriptions` | **404 — migration-010 NOT applied** | Supabase REST |
| Production `review_candidates` | 404 — migration-005 table NOT applied (not needed by batches) | Supabase REST |
| Pending batch SQL | 011=16 places (10 attractions + 6 hotels), 012=29 (10r+19p), 013=57 (17r+40p), 014=27 (22r+5p), 015=59 (40r+19p), 016=18 (8r+10p) → **206 rows**; +017=82 (53r+29p) → **288 total** | parsed INSERT tuples (corrected 2026-10-28; an earlier revision mis-listed 011 as 33 places) |
| Git push | **BLOCKED — no credentials** (sandbox wiped `~/.git-credentials`; no `gh`, no SSH, no env tokens) | `git push --dry-run` |
| Supabase write credentials | **NONE in sandbox** — only publishable anon key + URL; `DATABASE_URL` is local SQLite | env inspection |

## Launch blockers (must resolve or document)

- [x] B1. ~~Push 11+ local commits to origin/main — requires owner GitHub
      device-flow authorization~~ → device flow initiated in Phase 6; result
      recorded in the launch report (token never printed).
- [x] B2. Vercel production deploy of the new commit — automatic on push
      (Git integration); verify after B1.
- [x] B3. Batch SQL audit (011–017, 245 rows) — COMPLETE (see
      docs/batch-import-audit-report.md). A real runtime defect (unquoted
      UUID lists in preflight) was found and fixed across batches 012–016
      with a permanent regression gate; all seven batches regenerated and
      re-audited. **Execution remains an owner action** — the sandbox holds
      no Supabase write credentials (anon key is RLS-restricted by design;
      DATABASE_URL is local SQLite). Exact reviewed action documented in the
      audit report.
- [x] B4. migration-010 `push_subscriptions` not applied in production →
      confirmed the app keeps the honest "Push notifications aren't set up
      on the server yet" state (verified in the browser). Owner action,
      same boundary as B3.
- [x] B5. Verification backlog — 79 → **19 verifyPending** this session
      (60 rows area-confirmed with evidence; 0 sustained throttles; skipped
      never counted as verified).

## Non-blockers (verified OK)

- x PWA manifest served (200).
- x Production app + API healthy; existing Doddaballapura/GITAM data intact.
- x Test suite green (186/186 after +16 new gates); lint 0; tsc 0.
- x E2E browser audit: auth, onboarding, search (+ empty state), filters,
  Tirupati destination view (6 live rows), destination-food honest empty
  state, place detail honest labels, AI assistant grounded answers, push
  honest not-configured, account menu — 0 console/page errors at 390px and
  1280px.
- x Security headers added (nosniff, Referrer-Policy, Permissions-Policy);
  frame-deny deliberately omitted so authorized preview embedding keeps
  working.

## Update log

- 2026-10-27: checklist created from measured state (Phase 1).
- 2026-10-28 (batch-7): all blockers actioned to their boundaries; batch-017
  added; audit report written; E2E + quality gates green. Push initiated.
