#!/bin/sh
set -eu

# Usage: sh infra/tests/test-rate-limit.sh
# Requires the running Docker stack and its default 5r/s, burst=10 API limit.
# curl -k accepts the local self-signed certificate. No accounts/data are created.

BASE_URL=https://localhost:8443
test_dir=$(mktemp -d)
trap 'rm -rf "$test_dir"' 0
trap 'exit 1' HUP INT TERM
mkdir "$test_dir/requests"

pass() { printf 'PASS: %s\n' "$1"; }
fail() { printf 'FAIL: %s\n' "$1"; exit 1; }

request() {
    curl -ksS --max-time 10 -o /dev/null -w '%{http_code}\n' \
        -X "${2:-GET}" "$BASE_URL$1"
}

expect_status() {
    actual=$(request "$2") || fail "Could not reach $2"
    [ "$actual" = "$1" ] || fail "$2: expected $1, got $actual"
}

# Each background request writes its own file to avoid mixed output.
burst() {
    i=0
    while [ "$i" -lt 80 ]; do
        method=GET
        path=/api/health
        if [ "$1" = endpoints ]; then
            [ $((i % 2)) -eq 0 ] || path=/api/rooms
        else
            case $((i % 4)) in
                1) method=POST ;;
                2) method=PUT ;;
                3) method=DELETE ;;
            esac
        fi
        (
            printf '%s ' "$method"
            request "$path" "$method"
        ) > "$test_dir/requests/$i" &
        i=$((i + 1))
    done
    wait
    cat "$test_dir/requests"/*
}

# Let a previous test's allowance recover.
sleep 3
expect_status 200 /api/health
pass "Normal API request returns 200"

burst endpoints > "$test_dir/endpoints"
grep -q '^GET 200$' "$test_dir/endpoints" || fail "No API requests were accepted"
grep -q '^GET 429$' "$test_dir/endpoints" || fail "Burst did not trigger rate limiting"
awk 'NF != 2 || ($2 != 200 && $2 != 429) {bad=1} END {exit bad}' \
    "$test_dir/endpoints" || fail "Unexpected status during API burst"
pass "Burst across /api/health and /api/rooms returns both 200 and 429"

burst methods > "$test_dir/methods"
for method in GET POST PUT DELETE; do
    grep -q "^$method 429$" "$test_dir/methods" || fail "$method was not rate limited"
done
# Capacity refills during the test. Accepted non-GET health requests return 405.
awk 'NF != 2 || ($2 != 429 && !(($1 == "GET" && $2 == 200) || \
    ($1 != "GET" && $2 == 405))) {bad=1} END {exit bad}' \
    "$test_dir/methods" || fail "Unexpected status during method checks"
pass "GET, POST, PUT, and DELETE all receive 429 during bursts"

expect_status 200 /status
pass "Status page remains available during API rate limiting"

sleep 3
expect_status 200 /api/health
expect_status 401 /api/auth/me
pass "API recovers after 3 seconds; signed-out session check returns 401"

echo "ALL RATE-LIMIT CHECKS PASSED"
