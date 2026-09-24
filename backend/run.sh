#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONPATH=.

PORT="${PORT:-8000}"

if command -v lsof >/dev/null 2>&1; then
  EXISTING_PIDS="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${EXISTING_PIDS}" ]]; then
    echo "Port $PORT is already in use by PID(s): $EXISTING_PIDS"
    echo "Stopping conflicting process(es) so Seller Hub API can start..."
    # shellcheck disable=SC2086
    kill -9 $EXISTING_PIDS 2>/dev/null || true
    sleep 1
  fi
fi

if [[ ! -f .env ]]; then
  echo "Missing backend/.env — copy from .env.example and set KIE_API_KEY / Mongo settings."
  exit 1
fi

exec .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port "$PORT"
