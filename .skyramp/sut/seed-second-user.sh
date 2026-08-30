#!/bin/bash
# Create a second app user with weight entries of their own.
#
# The trainer view of the weight summary reads another user's data by id, so a
# test of it needs a second user whose entries differ from admin's. Runs inside
# the backend container through the Django shell. Idempotent: the user is only
# created once, and their id is printed either way.
set -euo pipefail

SUT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE="docker compose -f $SUT_DIR/docker-compose.testbot.yml --project-directory ."

$COMPOSE exec -T backend python3 manage.py shell -c '
from django.contrib.auth.models import User
from wger.weight.models import WeightEntry
from datetime import date, timedelta

member, created = User.objects.get_or_create(
    username="member1",
    defaults={"email": "member1@example.com"},
)
if created:
    member.set_password("member1pass")
    member.save()

if not WeightEntry.objects.filter(user=member).exists():
    for days_ago, kg in ((6, 70.0), (3, 70.6), (0, 71.1)):
        WeightEntry.objects.create(
            user=member,
            date=date.today() - timedelta(days=days_ago),
            weight=kg,
        )

print("MEMBER_ID=%d" % member.id)
' | grep MEMBER_ID
