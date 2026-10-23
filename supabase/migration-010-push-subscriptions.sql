-- ============================================================================
-- Foodie — migration 010: public.push_subscriptions (Web Push opt-in store)
-- ----------------------------------------------------------------------------
-- FILE STATUS: REVIEW CANDIDATE — PROPOSED, NOT EXECUTED, NOT APPROVED FOR RUN.
--   Companion to the minimal secure push-opt-in feature (public/sw.js,
--   src/lib/foodie/push.ts, /api/push/config, /api/push/test). Execution
--   remains the owner's single manual action in the Supabase SQL Editor,
--   only after approving this file.
--
-- WHAT THIS DOES
--   1) Creates public.push_subscriptions — one row per (user, browser).
--   2) RLS: OWN-ROWS-ONLY (select / insert / delete where user_id = auth.uid()).
--      There is deliberately NO service-role read path in the app codebase;
--      delivery reads run through the caller's own JWT.
--   3) Duplicate prevention: UNIQUE (user_id, endpoint_hash) — the client
--      upserts, so re-subscribing the same browser UPDATES the row instead
--      of duplicating it. endpoint_hash = SHA-256(endpoint) (client-computed).
--   4) Stale-row hygiene: dead endpoints (push 404/410) are deleted by the
--      delivery route in the same pass.
--
-- WHAT THIS DELIBERATELY DOES NOT DO
--   * No scheduled/notification-triggering logic in the database. The only
--     sender is /api/push/test (self-notification) until a reviewed feature
--     needs a real event source.
--   * No read-for-admins policy, no service-role grants beyond Supabase
--     defaults, no UPDATE of other users' rows.
--
-- PREREQUISITES
--   * auth schema (Supabase). user_id is intentionally NOT hard-FK'd to
--     auth.users (same posture as reviews/restaurant_photos app-side user
--     ids) — RLS scopes every read/write to auth.uid().
-- ============================================================================

-- 1) table -------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  endpoint      text not null,
  endpoint_hash text not null,
  p256dh        text not null,
  auth_key      text not null,
  created_at    timestamptz not null default now(),
  constraint push_subscriptions_user_endpoint_key unique (user_id, endpoint_hash)
);

comment on table public.push_subscriptions is
  'Web Push opt-in store — one row per (user, browser endpoint). RLS is OWN-ROWS-ONLY (user_id = auth.uid()). endpoint_hash = SHA-256(endpoint) is the duplicate-prevention key; stale endpoints (404/410) are deleted by the delivery route.';

comment on column public.push_subscriptions.auth_key is
  'Web Push auth secret from the browser subscription (PushSubscriptionJSON.keys.auth). Stored only to send this user their own notifications.';

-- 2) RLS — OWN ROWS ONLY -----------------------------------------------------
alter table public.push_subscriptions enable row level security;

drop policy if exists "own subscriptions are readable" on public.push_subscriptions;
create policy "own subscriptions are readable"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "own subscriptions are insertable" on public.push_subscriptions;
create policy "own subscriptions are insertable"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

-- The upsert duplicate-prevention path (on conflict update) needs UPDATE;
-- scoped to own rows exactly like select/insert/delete.
drop policy if exists "own subscriptions are updatable" on public.push_subscriptions;
create policy "own subscriptions are updatable"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own subscriptions are deletable" on public.push_subscriptions;
create policy "own subscriptions are deletable"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- 3) indexes -----------------------------------------------------------------
create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

-- 4) POST-ASSERT — loud structural check (same discipline as migration-008) --
do $assert_push_subs$
declare
  v_columns  integer;
  v_unique   integer;
  v_rls      boolean;
  v_policies integer;
begin
  select count(*) into v_columns
    from information_schema.columns
   where table_schema = 'public' and table_name = 'push_subscriptions'
     and column_name in ('id','user_id','endpoint','endpoint_hash','p256dh','auth_key','created_at');
  if v_columns <> 7 then
    raise exception 'ASSERT FAIL: push_subscriptions has % of the 7 approved columns.', v_columns;
  end if;

  select count(*) into v_unique
    from pg_constraint
   where conrelid = 'public.push_subscriptions'::regclass
     and conname = 'push_subscriptions_user_endpoint_key' and contype = 'u';
  if v_unique <> 1 then
    raise exception 'ASSERT FAIL: the (user_id, endpoint_hash) uniqueness constraint is missing.';
  end if;

  select rowsecurity into v_rls
    from pg_tables
   where schemaname = 'public' and tablename = 'push_subscriptions';
  if v_rls is distinct from true then
    raise exception 'ASSERT FAIL: RLS is not enabled on push_subscriptions.';
  end if;

  select count(*) into v_policies
    from pg_policies
   where schemaname = 'public' and tablename = 'push_subscriptions';
  if v_policies <> 4 then
    raise exception 'ASSERT FAIL: expected exactly 4 own-rows-only policies, found %.', v_policies;
  end if;

  raise notice 'ASSERT OK: push_subscriptions matches the approved design (7 columns, unique key, RLS, 4 own-row policies).';
end
$assert_push_subs$;

-- 5) post-migration verification — READ-ONLY (expected on a healthy run) -----
select tablename, rowsecurity
  from pg_tables
 where schemaname = 'public' and tablename = 'push_subscriptions';           -- 1 row, rowsecurity = true

select policyname, cmd, roles
  from pg_policies
 where schemaname = 'public' and tablename = 'push_subscriptions'
 order by cmd;                                                                -- exactly 4: delete/insert/select/update

select conname, contype
  from pg_constraint
 where conrelid = 'public.push_subscriptions'::regclass
 order by contype, conname;                                                   -- must contain push_subscriptions_user_endpoint_key (u)

select count(*) as push_subscription_rows_must_be_zero
  from public.push_subscriptions;                                             -- 0 (structure only)

-- ============================================================================
-- ROLLBACK (COMMENTED — inert; uncomment ONLY after reading the conditions)
-- ----------------------------------------------------------------------------
--   drop table if exists public.push_subscriptions;
-- Safe when: no stored subscriptions you need (count check first — the table
-- only ever holds the users' own opt-in endpoints) and no application code
-- depends on the table (the UI degrades to "notifications aren't set up"
-- honestly when it is missing).
-- ============================================================================

-- NOTHING IN THIS FILE HAS BEEN EXECUTED. Execution remains the owner's
-- single manual action in the Supabase SQL Editor, only after approval.
