-- ============================================================================
-- Foodie — MIGRATION 007: dish provenance (menu item source URLs)
-- ============================================================================
-- Part of the Prototype 2 enrichment pipeline. Minimal, additive schema
-- change: menu items retrieved from published listing pages must carry WHERE
-- each item/price came from, so the app can show honest provenance ("prices
-- from published listing: magicpin.in") and audits can trace every fact.
--
-- COMPATIBILITY:
--   * additive only — one nullable text column, no defaults, no data changes.
--   * RLS unchanged (dishes remain public-read).
--   * idempotent: add column if not exists — safe to re-run.
--
-- Apply via Supabase Dashboard -> SQL Editor BEFORE insert-batch-008-menus.sql
-- (the batch's preflight verifies the column and refuses otherwise).
-- ============================================================================

alter table public.dishes add column if not exists source_url text;

comment on column public.dishes.source_url is
  'URL of the page that published this menu item (and its price, when shown). NULL = unknown — never invented. Every enrichment-pipeline row MUST carry this.';
