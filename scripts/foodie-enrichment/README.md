# Foodie — Prototype 2 Enrichment Pipeline

License-aware photo + evidence-based menu enrichment for the live Foodie
database. **Read-only research → reviewable worksheets → generated SQL that a
human runs in the Supabase SQL Editor** (same write path as the place-import
batches). Nothing in this pipeline ever writes to Supabase directly.

## Honesty rules (non-negotiable)

1. **Photos enter the database only with recorded usage rights.** Sources are
   deliberately license-aware (Wikimedia Commons, Openverse filtered to
   cc0/pdm/by/by-sa). Generic image-scrape results with unknown licensing are
   never used. No license recorded → no row (see `migration-006`).
2. **Menu items are extracted, never invented.** An item exists in the
   worksheet only when a source fragment literally names it; a price is stored
   only when the source published one (otherwise NULL). Every row carries its
   `source_url` (see `migration-007`). No source URL → no row.
3. **Conservative matching.** A photo is machine-approved only when the source
   title contains the place's distinctive name ("exact"). Fuzzy/lead candidates
   are persisted for human review and never become SQL.
4. **Idempotent SQL.** Batch 007/008 use `WHERE NOT EXISTS` guards on natural
   keys, so re-running never duplicates photos or menu items. Preflight gates
   verify the restaurant baseline (77 rows), target ids and required columns;
   postflight verifies counts, provenance and uniqueness — any failure rolls
   back the whole transaction.

## Workflow

```bash
# 1) research (read-only; resumable — re-run continues where it stopped)
bun scripts/foodie-enrichment/research-photos.ts
bun scripts/foodie-enrichment/research-menus.ts        # bounded to 40 live-page reads/run

# 2) review + merge evidence into worksheets
bun scripts/foodie-enrichment/build-worksheets.ts

# 3) generate the SQL batches (deterministic; never hand-edit output)
bun scripts/foodie-enrichment/gen-insert-batches.ts

# 4) human runs, in order, in Supabase SQL Editor:
#      supabase/migration-006-photo-licensing.sql   (once; idempotent)
#      supabase/migration-007-dish-provenance.sql   (once; idempotent)
#      supabase/insert-batch-007-photos.sql         (idempotent)
#      supabase/insert-batch-008-menus.sql          (idempotent)
```

## Files

| Path | Purpose |
| --- | --- |
| `lib/types.ts` | Shared candidate/evidence types |
| `lib/live.ts` | Read-only live-baseline reader + polite fetch + match rule |
| `lib/menuParse.ts` | Mechanical "Item … Rs N" extractor (no invention) |
| `research-photos.ts` | Commons + Openverse research → `evidence/photos/*.json` |
| `research-menus.ts` | Worksheet notes + listing pages + search fallback → `evidence/menus/*.json` |
| `build-worksheets.ts` | Dedupe + verdicts → `worksheets/{photo,menu}-enrichment.json` |
| `gen-insert-batches.ts` | Worksheets → `supabase/insert-batch-007-photos.sql` + `supabase/insert-batch-008-menus.sql` |
