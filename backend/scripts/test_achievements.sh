#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
test_container="trivia-achievements-test-$(date +%s)-$$"
cleanup() { docker rm -f "$test_container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run -d --name "$test_container" --tmpfs /var/lib/postgresql/data \
  -e POSTGRES_USER=achievement_test -e POSTGRES_PASSWORD=achievement_test \
  -e POSTGRES_DB=achievement_test -p 127.0.0.1::5432 postgres:16-alpine >/dev/null
for attempt in {1..30}; do
  if docker exec "$test_container" pg_isready -h 127.0.0.1 -U achievement_test -d achievement_test >/dev/null 2>&1; then break; fi
  sleep 1
done
test_port=$(docker port "$test_container" 5432 | sed 's/.*://')
export ACHIEVEMENT_TEST_DATABASE_URL="postgresql+asyncpg://achievement_test:achievement_test@127.0.0.1:${test_port}/achievement_test"
export PYTHONDONTWRITEBYTECODE=1
if [[ "$#" == 0 ]]; then
  set -- tests/test_achievement_journey.py tests/test_persistence.py tests/test_events.py tests/test_ingestion.py app/dataProcessing/test.py
fi
uv run --locked --group dev python -m pytest -q -p no:cacheprovider "$@" --disable-warnings --tb=short
