#!/bin/bash
# Get the DRF Token for the admin user.
# Idempotent: returns the existing token or creates one if it doesn't exist.
set -euo pipefail

COMPOSE_FILE="$(dirname "$0")/docker-compose.testbot.yml"

TOKEN=$(docker compose -f "$COMPOSE_FILE" --project-directory . \
  exec -T backend python3 manage.py drf_create_token admin 2>/dev/null \
  | awk '{print $3}')

if [ -z "$TOKEN" ]; then
  echo "ERROR: could not obtain auth token for admin" >&2
  exit 1
fi

printf '%s' "$TOKEN"
