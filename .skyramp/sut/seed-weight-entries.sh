#!/bin/bash
# Seed a few body weight entries for the admin user.
#
# The weight table and its inline editing have nothing to act on when the user
# has no entries, so a UI test can only assert the empty state. Idempotent:
# entries are only added when the user has none.
set -euo pipefail

TOKEN="${1:?usage: seed-weight-entries.sh <api-token>}"
API="${2:-http://localhost:8000/api/v2}"

count=$(curl -sf -H "Authorization: Token $TOKEN" "$API/weightentry/?limit=1" | sed -n 's/.*"count":\([0-9]*\).*/\1/p')

if [ "${count:-0}" -gt 0 ]; then
  echo "Weight entries already present ($count), not seeding"
  exit 0
fi

# Descending weights over the last week, so the table's difference and total
# change columns have something to compute.
#
# Noon UTC, not midnight: the API echoes the entry back in the server's local
# time, and the grid renders that. A midnight timestamp lands on the previous
# day for any negative offset, so a test that matches a row by its rendered
# date would look for a day that is not there.
i=0
for pair in "8:80.50" "5:81.20" "2:81.90"; do
  days_ago="${pair%%:*}"
  weight="${pair##*:}"
  date=$(date -u -v-"${days_ago}"d +%Y-%m-%d 2>/dev/null || date -u -d "${days_ago} days ago" +%Y-%m-%d)

  curl -sf -X POST "$API/weightentry/" \
    -H "Authorization: Token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"date\": \"${date}T12:00:00Z\", \"weight\": \"${weight}\", \"notes\": \"\"}" > /dev/null
  i=$((i + 1))
done

echo "Seeded $i weight entries"
