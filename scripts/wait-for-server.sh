#!/usr/bin/env bash
# wait-for-server.sh — polls a URL until it returns HTTP 200 or times out.
#
# Usage:
#   ./scripts/wait-for-server.sh <url> [timeout_seconds]
#
# Examples:
#   ./scripts/wait-for-server.sh http://localhost:5000/api/health
#   ./scripts/wait-for-server.sh https://mautam-api.onrender.com/api/health 120

set -euo pipefail

URL="${1:?Usage: wait-for-server.sh <url> [timeout_seconds]}"
TIMEOUT="${2:-60}"
INTERVAL=3
ELAPSED=0

echo "⏳ Waiting for $URL (timeout: ${TIMEOUT}s) ..."

until curl -sf --max-time 5 "$URL" > /dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "❌ Timed out after ${TIMEOUT}s — $URL never responded."
    exit 1
  fi
  echo "   ... not ready yet (${ELAPSED}s elapsed), retrying in ${INTERVAL}s"
  sleep "$INTERVAL"
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "✅ Server is ready at $URL (${ELAPSED}s)"
