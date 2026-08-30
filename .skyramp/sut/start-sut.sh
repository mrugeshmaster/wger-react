#!/bin/bash
# Bring up the backend and the frontend, in that order.
#
# The frontend needs an API token baked into its bundle: the app has no working
# login form, so src/config.ts reads VITE_API_KEY and every request without it
# is rejected. The token only exists once the backend has migrated, so the
# backend has to be healthy before the frontend starts. Vite reads VITE_*
# from the process environment, so the value is passed as a container env var.
set -euo pipefail

SUT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE="docker compose -f $SUT_DIR/docker-compose.testbot.yml --project-directory ."

$COMPOSE up -d --build --wait backend

VITE_API_KEY="$(bash "$SUT_DIR/get-auth-token.sh")"
export VITE_API_KEY

bash "$SUT_DIR/seed-weight-entries.sh" "$VITE_API_KEY"

# A second user with entries of their own, so the trainer view of the weight
# summary (?user=) has someone else's data to read.
bash "$SUT_DIR/seed-second-user.sh"

$COMPOSE up -d --build frontend
