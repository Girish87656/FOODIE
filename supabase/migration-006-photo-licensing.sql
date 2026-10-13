-- ============================================================================
-- Foodie — MIGRATION 006: photo licensing & attribution metadata
-- ============================================================================
-- Part 2 (real place data & genuine photos) — minimal, additive schema change.
--
-- WHY: research-sourced or community-contributed photos must be able to carry
-- their provenance: where the image came from (source_url), what permits its
-- use (license — e.g. "CC BY-SA 4.0", "published by the business"), and who
-- must be credited (attribution). Without these columns there is NO honest way
-- to show a photo that is not the app's own; the UI therefore renders
-- attribution whenever the columns are populated and shows nothing invented
-- when they are NULL.
--
-- COMPATIBILITY:
--   * additive only — three nullable text columns, no defaults, no DDL on
--     existing columns, no data changes; existing rows keep working (NULL =
--     "no licensing information recorded", and the app already degrades to the
--     photo-unavailable fallback when an image URL fails to load).
--   * RLS unchanged (photos remain public-read via the existing policies).
--   * idempotent: add column if not exists — safe to re-run.
--
-- Apply via Supabase Dashboard -> SQL Editor (same write path as the place
-- import batches). Run BEFORE inserting any photo rows that carry licensing
-- metadata (supabase/insert-batch-007-photos.sql).
-- ============================================================================

alter table public.restaurant_photos add column if not exists source_url   text;
alter table public.restaurant_photos add column if not exists license      text;
alter table public.restaurant_photos add column if not exists attribution  text;

comment on column public.restaurant_photos.source_url is
  'URL of the page the photo was taken from (the listing/site that publishes it). NULL = unknown — never invented.';
comment on column public.restaurant_photos.license is
  'Usage basis for the photo, verbatim (e.g. "CC BY-SA 4.0", "published by the business on its official page"). NULL = usage rights not established — the photo must not be displayed.';
comment on column public.restaurant_photos.attribution is
  'Credit line to display with the photo (creator/publisher name). NULL = no attribution obligation recorded.';
