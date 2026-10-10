#!/usr/bin/env bash

set +e
fail=0

pass() {
    echo "PASS: $1"
}

fail_test() {
    echo "FAIL: $1"
    fail=1
}

echo "========================================"
echo "       IV.7 ACCEPTANCE TEST"
echo "========================================"

echo
echo "=== 1. Container health ==="

for svc in vault postgres backup backend frontend nginx; do
    cid="$(docker compose ps -q "$svc")"

    if [ -z "$cid" ]; then
        fail_test "$svc container not found"
        continue
    fi

    svc_state="$(docker inspect \
        -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
        "$cid")"

    case "$svc_state" in
        healthy|running)
            pass "$svc is $svc_state"
            ;;
        *)
            fail_test "$svc is $svc_state"
            ;;
    esac
done


echo
echo "=== 2. Vault bootstrap ==="

bootstrap_id="$(docker compose ps -a -q vault-bootstrap)"

if [ -n "$bootstrap_id" ] &&
   [ "$(docker inspect -f '{{.State.ExitCode}}' "$bootstrap_id")" = "0" ]; then
    pass "Vault bootstrap completed successfully"
else
    fail_test "Vault bootstrap failed"
fi


echo
echo "=== 3. Backend liveness ==="
if curl -ksSf https://localhost:8443/api/health |
   grep -q '"status":"ok"'; then
  pass "/api/health works"
else
  fail_test "/api/health failed"
fi

echo
echo "=== 4. Database readiness ==="
if curl -ksSf https://localhost:8443/api/ready |
   grep -q '"database":"ok"'; then
  pass "/api/ready successfully queried PostgreSQL"
else
  fail_test "/api/ready failed"
fi


echo
echo "=== 5. Status page ==="

if curl -ksSf https://localhost:8443/status |
   grep -qi 'System status'; then
    pass "/status page is reachable"
else
    fail_test "/status page failed"
fi


echo
echo "=== 6. Backup status ==="

if curl -ksSf https://localhost:8443/backup-status |
   grep -q '"status":"operational"'; then
    pass "backup status is operational"
else
    fail_test "backup status is not operational"
fi


echo
echo "=== 7. Backup file ==="

latest_backup="$(
docker compose exec -T backup sh -c '
latest=""
for f in /backups/trivia_*.dump; do
    [ -s "$f" ] && latest="$f"
done
printf "%s" "$latest"
' < /dev/null
)"

if [ -n "$latest_backup" ]; then
    pass "backup exists: $(basename "$latest_backup")"
else
    fail_test "no non-empty PostgreSQL backup found"
fi


echo
echo "=== 8. Backup freshness ==="

if docker compose exec -T backup sh -c '
test -s /backups/last_success || exit 1

last=$(cat /backups/last_success)
now=$(date +%s)
age=$((now-last))

[ "$age" -ge 0 ] &&
[ "$age" -le "${BACKUP_MAX_AGE_SECONDS:-7200}" ]
' < /dev/null; then
    pass "latest backup is fresh"
else
    fail_test "backup is stale"
fi


echo
echo "=== 9. Dump integrity ==="

if [ -n "$latest_backup" ] &&
   docker compose exec -T backup \
      pg_restore --list "$latest_backup" \
      >/dev/null 2>&1 < /dev/null; then
    pass "pg_restore recognizes backup as valid"
else
    fail_test "backup dump validation failed"
fi


echo
echo "=== 10. Password exposure ==="

backup_id="$(docker compose ps -q backup)"

if [ -n "$backup_id" ] &&
   ! docker inspect "$backup_id" \
      --format '{{range .Config.Env}}{{println .}}{{end}}' |
      grep -q '^PGPASSWORD='; then
    pass "PGPASSWORD is absent from Docker metadata"
else
    fail_test "PGPASSWORD is exposed in Docker metadata"
fi


echo
echo "=== 11. Vault read permission ==="

if docker compose exec -T backup sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
    role_id="$(cat /vault/approle/role-id)" \
    secret_id="$(cat /vault/approle/secret-id)") || exit 1

VAULT_TOKEN="$TOKEN" vault kv get \
    -field=password secret/trivia/postgres >/dev/null
' < /dev/null; then
    pass "backup can read required DB secret"
else
    fail_test "backup cannot read DB secret"
fi


echo
echo "=== 12. Vault write restriction ==="

if docker compose exec -T backup sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
    role_id="$(cat /vault/approle/role-id)" \
    secret_id="$(cat /vault/approle/secret-id)") || exit 1

VAULT_TOKEN="$TOKEN" vault kv put \
    secret/trivia/forbidden-backup-test value=test \
    >/dev/null 2>&1
' < /dev/null; then
    fail_test "backup can write Vault secrets"
else
    pass "backup cannot write Vault secrets"
fi


echo
echo "=== 13. Disaster recovery restore ==="

if [ -n "$latest_backup" ] &&
   docker compose exec -T backup \
      /usr/local/bin/restore.sh "$latest_backup" \
      < /dev/null; then
    pass "backup restored into temporary database"
else
    fail_test "restore failed"
fi


echo
echo "=== 14. Verify restored database ==="

if docker compose exec -T backup sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
    role_id="$(cat /vault/approle/role-id)" \
    secret_id="$(cat /vault/approle/secret-id)") || exit 1

PGPASSWORD=$(VAULT_TOKEN="$TOKEN" vault kv get \
    -field=password secret/trivia/postgres) || exit 1

export PGPASSWORD

psql \
    -h postgres \
    -U "$POSTGRES_USER" \
    -d "${POSTGRES_DB}_restore_test" \
    -tAc "SELECT 1;" |
    grep -qx '1'
' < /dev/null; then
    pass "restored database accepts queries"
else
    fail_test "restored database verification failed"
fi


echo
echo "=== 15. Cleanup restore database ==="

if docker compose exec -T backup sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
    role_id="$(cat /vault/approle/role-id)" \
    secret_id="$(cat /vault/approle/secret-id)") || exit 1

PGPASSWORD=$(VAULT_TOKEN="$TOKEN" vault kv get \
    -field=password secret/trivia/postgres) || exit 1

export PGPASSWORD

dropdb \
    -h postgres \
    -U "$POSTGRES_USER" \
    --if-exists "${POSTGRES_DB}_restore_test"
' < /dev/null; then
    pass "temporary restore database removed"
else
    fail_test "temporary restore DB cleanup failed"
fi


echo
echo "=== Final Compose status ==="

docker compose ps -a


echo
echo "========================================"

if [ "$fail" -eq 0 ]; then
    echo "ALL IV.7 TESTS PASSED"
else
    echo "ONE OR MORE IV.7 TESTS FAILED"
fi

echo "========================================"

exit "$fail"
