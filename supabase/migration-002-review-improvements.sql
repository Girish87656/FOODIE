-- ============================================================================
-- Foodie — migration 002: review improvements
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file ->
--   Run. Safe to re-run (every step is guarded and idempotent).
--
-- WHAT THIS DOES (reviews table ONLY — no other table is touched):
--   1) user_id becomes NOT NULL — SAFE because the reviews table is empty
--      (verified live before this migration: 0 rows) and every INSERT path
--      is already restricted by RLS to `user_id = auth.uid()` (authenticated
--      users only). Anonymous/legacy reviews can no longer exist.
--   2) The user_id FK action changes from ON DELETE SET NULL (which would
--      contradict NOT NULL and make auth-user deletion fail) to
--      ON DELETE CASCADE (deleting an auth user deletes their reviews —
--      the standard review-system behaviour).
--   3) ONE review per user per restaurant: UNIQUE (restaurant_id, user_id).
--   4) Review text length constraint: 1..2000 characters after whatever the
--      client trims (empty and oversized texts are rejected by the database).
--   5) rating stays restricted to 1..5 — the original inline table check
--      (rating >= 1 AND rating <= 5) already enforces this and is NOT
--      duplicated here; this file only VERIFIES it exists.
--
-- RESTAURANT DATA IS NOT TOUCHED: no restaurants/dishes/photos rows or
-- coordinates are modified, and NO review rows are inserted.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) user_id NOT NULL (+ FK action compatibility)
-- ---------------------------------------------------------------------------
do $$
begin
  -- 1a) NOT NULL (idempotent: re-applying SET NOT NULL is a no-op, but the
  --     guard keeps the log clean and avoids revalidating a big table).
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'reviews'
      and column_name  = 'user_id'
      and is_nullable  = 'YES'
  ) then
    alter table public.reviews alter column user_id set not null;
    raise notice 'reviews.user_id is now NOT NULL';
  else
    raise notice 'reviews.user_id already NOT NULL — skipped';
  end if;

  -- 1b) FK action: SET NULL would violate NOT NULL when an auth user is
  --     deleted (user deletion would fail for anyone with reviews). Swap to
  --     CASCADE so account deletion cleanly removes their reviews.
  if exists (
    select 1 from pg_constraint
    where conname   = 'reviews_user_id_fkey'
      and conrelid  = 'public.reviews'::regclass
      and confdeltype = 'n'  -- 'n' = set null
  ) then
    alter table public.reviews
      drop constraint reviews_user_id_fkey;
    alter table public.reviews
      add constraint reviews_user_id_fkey
      foreign key (user_id) references auth.users (id)
      on delete cascade;
    raise notice 'reviews_user_id_fkey switched to ON DELETE CASCADE';
  else
    raise notice 'reviews_user_id_fkey already compatible — skipped';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2) ONE review per user per restaurant
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname  = 'reviews_restaurant_user_key'
      and conrelid = 'public.reviews'::regclass
  ) then
    alter table public.reviews
      add constraint reviews_restaurant_user_key
      unique (restaurant_id, user_id);
    raise notice 'reviews_restaurant_user_key (unique restaurant_id+user_id) added';
  else
    raise notice 'reviews_restaurant_user_key already exists — skipped';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 3) Review text length: 1..2000 characters
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname  = 'reviews_review_length_check'
      and conrelid = 'public.reviews'::regclass
  ) then
    alter table public.reviews
      add constraint reviews_review_length_check
      check (char_length(review) between 1 and 2000);
    raise notice 'reviews_review_length_check (1..2000 chars) added';
  else
    raise notice 'reviews_review_length_check already exists — skipped';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 4) Verify rating is still restricted to 1..5 (existing table-level check).
--    Migration FAILS LOUDLY if the check is missing so the gap is never silent.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reviews'::regclass
      and contype  = 'c'
      and pg_get_constraintdef(pg_constraint.oid) ilike '%rating%'
      and pg_get_constraintdef(pg_constraint.oid) ilike '%5%'
  ) then
    raise exception 'reviews.rating 1-5 check constraint NOT found — add it before proceeding';
  else
    raise notice 'reviews.rating 1-5 check verified';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 5) RLS unchanged (verified, not modified):
--      - "reviews are readable by everyone"        (public SELECT)
--      - "users can write their own reviews"       (INSERT to authenticated
--                                                   with check user_id = auth.uid())
--      - "users can update their own reviews"      (UPDATE to authenticated
--                                                   using + check user_id = auth.uid())
--      - "users can delete their own reviews"      (DELETE to authenticated
--                                                   using user_id = auth.uid())
--    Row Level Security itself stays ENABLED on public.reviews.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_class
    where oid = 'public.reviews'::regclass and relrowsecurity = true
  ) then
    raise exception 'RLS is NOT enabled on public.reviews — refusing to finish migration';
  else
    raise notice 'RLS verified ENABLED on public.reviews';
  end if;
end
$$;
