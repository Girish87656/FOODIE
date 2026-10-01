#!/bin/bash

set -euo pipefail

# 获取脚本所在目录（.zscripts）
# 使用 $0 获取脚本路径（与 build.sh 保持一致）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log_step_start() {
        local step_name="$1"
        echo "=========================================="
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting: $step_name"
        echo "=========================================="
        export STEP_START_TIME
        STEP_START_TIME=$(date +%s)
}

log_step_end() {
        local step_name="${1:-Unknown step}"
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - STEP_START_TIME))
        echo "=========================================="
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Completed: $step_name"
        echo "[LOG] Step: $step_name | Duration: ${duration}s"
        echo "=========================================="
        echo ""
}

start_mini_services() {
        local mini_services_dir="$PROJECT_DIR/mini-services"
        local started_count=0

        log_step_start "Starting mini-services"
        if [ ! -d "$mini_services_dir" ]; then
                echo "Mini-services directory not found, skipping..."
                log_step_end "Starting mini-services"
                return 0
        fi

        echo "Found mini-services directory, scanning for sub-services..."

        for service_dir in "$mini_services_dir"/*; do
                if [ ! -d "$service_dir" ]; then
                        continue
                fi

                local service_name
                service_name=$(basename "$service_dir")
                echo "Checking service: $service_name"

                if [ ! -f "$service_dir/package.json" ]; then
                        echo "[$service_name] No package.json found, skipping..."
                        continue
                fi

                if ! grep -q '"dev"' "$service_dir/package.json"; then
                        echo "[$service_name] No dev script found, skipping..."
                        continue
                fi

                echo "Starting $service_name in background..."
                (
                        cd "$service_dir"
                        echo "[$service_name] Installing dependencies..."
                        bun install
                        echo "[$service_name] Running bun run dev..."
                        exec bun run dev
                ) >"$PROJECT_DIR/.zscripts/mini-service-${service_name}.log" 2>&1 &

                local service_pid=$!
                echo "[$service_name] Started in background (PID: $service_pid)"
                echo "[$service_name] Log: $PROJECT_DIR/.zscripts/mini-service-${service_name}.log"
                disown "$service_pid" 2>/dev/null || true
                started_count=$((started_count + 1))
        done

        echo "Mini-services startup completed. Started $started_count service(s)."
        log_step_end "Starting mini-services"
}

wait_for_service() {
        local host="$1"
        local port="$2"
        local service_name="$3"
        local max_attempts="${4:-60}"
        local attempt=1

        echo "Waiting for $service_name to be ready on $host:$port..."

        while [ "$attempt" -le "$max_attempts" ]; do
                if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
                        echo "$service_name is ready!"
                        return 0
                fi

                echo "Attempt $attempt/$max_attempts: $service_name not ready yet, waiting..."
                sleep 1
                attempt=$((attempt + 1))
        done

        echo "ERROR: $service_name failed to start within $max_attempts seconds"
        return 1
}

cleanup() {
        if [ -n "${DEV_PID:-}" ] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
                echo "Stopping Next.js dev server (PID: $DEV_PID)..."
                kill "$DEV_PID" >/dev/null 2>&1 || true
        fi
}

trap cleanup EXIT INT TERM

cd "$PROJECT_DIR"

# ---------------------------------------------------------------------------
# Supabase env self-heal (permanent fix for the boot-time .env rewrite).
#
# The platform's /start.sh rewrites .env down to a single DATABASE_URL line
# on every boot, which used to wipe the Supabase variables and silently push
# Foodie into demo auth mode. Two defenses here (idempotent, secrets never
# printed):
#
#   1. If .env lost the Supabase variables, restore the tracked .env from
#      git HEAD (the canonical committed copy — values are never hardcoded
#      in this script and never committed by it).
#   2. Derive .env.local with the current publishable-key naming from .env.
#      .env stays the single source of truth; .env.local is regenerated every
#      boot so it can never go stale. Next.js loads .env.local with higher
#      precedence, so the app always sees NEXT_PUBLIC_SUPABASE_URL +
#      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (legacy anon name still honored
#      by src/lib/supabase/config.ts).
# ---------------------------------------------------------------------------
log_step_start "Supabase env self-heal"
if ! grep -q '^NEXT_PUBLIC_SUPABASE_URL=' .env 2>/dev/null; then
  if git show HEAD:.env 2>/dev/null | grep -q '^NEXT_PUBLIC_SUPABASE_URL='; then
    git show HEAD:.env > .env
    echo "[ENV] .env was truncated at boot — restored Supabase variables from git HEAD"
  else
    echo "[ENV] WARNING: NEXT_PUBLIC_SUPABASE_URL missing and not recoverable from git HEAD — auth will show a configuration error" >&2
  fi
fi
SUPABASE_URL_LINE="$(grep -m1 '^NEXT_PUBLIC_SUPABASE_URL=' .env 2>/dev/null || true)"
SUPABASE_KEY_VAL="$(grep -m1 '^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=' .env 2>/dev/null | cut -d= -f2- || true)"
if [ -z "$SUPABASE_KEY_VAL" ]; then
  SUPABASE_KEY_VAL="$(grep -m1 '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env 2>/dev/null | cut -d= -f2- || true)"
fi
if [ -n "$SUPABASE_URL_LINE" ] && [ -n "$SUPABASE_KEY_VAL" ]; then
  {
    echo "# Auto-generated by .zscripts/dev.sh at boot — do NOT edit by hand."
    echo "# Canonical source: .env (edit there, then restart the dev server)."
    echo "$SUPABASE_URL_LINE"
    echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_KEY_VAL"
  } > .env.local
  echo "[ENV] .env.local refreshed with publishable-key naming (derived from .env)"
else
  echo "[ENV] WARNING: could not derive .env.local (missing URL or key in .env)" >&2
fi
log_step_end "Supabase env self-heal"

if ! command -v bun >/dev/null 2>&1; then
        echo "ERROR: bun is not installed or not in PATH"
        exit 1
fi

log_step_start "bun install"
echo "[BUN] Installing dependencies..."
bun install
log_step_end "bun install"

log_step_start "bun run db:push"
echo "[BUN] Setting up database..."
bun run db:push
log_step_end "bun run db:push"

log_step_start "Starting Next.js dev server"
echo "[BUN] Starting development server..."
bun run dev &
DEV_PID=$!
log_step_end "Starting Next.js dev server"

log_step_start "Waiting for Next.js dev server"
wait_for_service "localhost" "3000" "Next.js dev server"
log_step_end "Waiting for Next.js dev server"

log_step_start "Health check"
echo "[BUN] Performing health check..."
curl -fsS localhost:3000 >/dev/null
echo "[BUN] Health check passed"
log_step_end "Health check"

start_mini_services

echo "Next.js dev server is running in background (PID: $DEV_PID)."
echo "Use 'kill $DEV_PID' to stop it."
disown "$DEV_PID" 2>/dev/null || true
unset DEV_PID
