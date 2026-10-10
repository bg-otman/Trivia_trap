#!/bin/sh

# Vault integration smoke/security test for Trivia Trap.
# This version assumes JWT_SECRET_KEY is stored at
# secret/trivia/backend-auth and injected by Vault Agent.
#
# Usage:
#   ./test-vault.sh              # current/default Compose project
#   ./test-vault.sh vaultclean   # specific Compose project name

PROJECT_NAME="${1:-}"
fail=0

# Run docker compose with or without an explicit project name.
dc() {
  if [ -n "$PROJECT_NAME" ]; then
    docker compose -p "$PROJECT_NAME" "$@"
  else
    docker compose "$@"
  fi
}

pass() { printf 'PASS: %s\n' "$1"; }
fail_msg() { printf 'FAIL: %s\n' "$1"; fail=1; }

echo "=== 1. Container health ==="
for svc in vault postgres backend frontend nginx; do
  cid="$(dc ps -q "$svc")"

  if [ -z "$cid" ]; then
    fail_msg "$svc container not found"
    continue
  fi

  svc_status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null)"

  if [ "$svc_status" = "healthy" ] || [ "$svc_status" = "running" ]; then
    pass "$svc is $svc_status"
  else
    fail_msg "$svc is ${svc_status:-unknown}"
  fi
done

echo
echo "=== 2. Vault unsealed ==="
if dc exec -T vault sh -c 'vault status 2>/dev/null | grep -q "Sealed.*false"'; then
  pass "Vault is unsealed"
else
  fail_msg "Vault is sealed/unavailable"
fi

echo
echo "=== 3. HTTPS/backend ==="
if curl -ksSf https://localhost:8443/api/rooms >/dev/null; then
  pass "HTTPS backend route works"
else
  fail_msg "HTTPS backend route failed"
fi

echo
echo "=== 4. Vault secret -> PostgreSQL ==="
if dc exec -T postgres sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
  role_id="$(cat /vault/approle/role-id)" \
  secret_id="$(cat /vault/approle/secret-id)") || exit 1

DB_PASSWORD=$(VAULT_TOKEN="$TOKEN" vault kv get \
  -field=password secret/trivia/postgres) || exit 1

PGPASSWORD="$DB_PASSWORD" psql \
  -h 127.0.0.1 \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -tAc "SELECT 1;" | grep -qx "1"
'; then
  pass "Vault password authenticates to PostgreSQL"
else
  fail_msg "Vault/PostgreSQL authentication failed"
fi

echo
echo "=== 5. Backend Vault permissions ==="
if dc exec -T backend sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
  role_id="$(cat /vault/approle/role-id)" \
  secret_id="$(cat /vault/approle/secret-id)") || exit 1

VAULT_TOKEN="$TOKEN" vault kv get \
  -field=password secret/trivia/postgres >/dev/null
'; then
  pass "backend can read the PostgreSQL secret"
else
  fail_msg "backend cannot read the PostgreSQL secret"
fi

if dc exec -T backend sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
  role_id="$(cat /vault/approle/role-id)" \
  secret_id="$(cat /vault/approle/secret-id)") || exit 1

JWT_KEY=$(VAULT_TOKEN="$TOKEN" vault kv get \
  -field=jwt_secret_key secret/trivia/backend-auth) || exit 1

[ "${#JWT_KEY}" -eq 64 ] || exit 1
case "$JWT_KEY" in
  *[!0-9a-f]*) exit 1 ;;
esac
'; then
  pass "backend can read a valid JWT signing key"
else
  fail_msg "backend cannot read a valid JWT signing key"
fi

if dc exec -T backend sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
  role_id="$(cat /vault/approle/role-id)" \
  secret_id="$(cat /vault/approle/secret-id)") || exit 1

VAULT_TOKEN="$TOKEN" vault kv put \
  secret/trivia/forbidden-test value=test >/dev/null 2>&1
'; then
  fail_msg "backend can write secrets"
else
  pass "backend cannot write secrets"
fi

if dc exec -T backend sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
  role_id="$(cat /vault/approle/role-id)" \
  secret_id="$(cat /vault/approle/secret-id)") || exit 1

VAULT_TOKEN="$TOKEN" vault policy list >/dev/null 2>&1
'; then
  fail_msg "backend has Vault admin access"
else
  pass "backend has no Vault admin access"
fi

echo
echo "=== 6. PostgreSQL AppRole isolation ==="
if dc exec -T postgres sh -c '
export VAULT_ADDR=http://vault:8200

TOKEN=$(vault write -field=token auth/approle/login \
  role_id="$(cat /vault/approle/role-id)" \
  secret_id="$(cat /vault/approle/secret-id)") || exit 1

VAULT_TOKEN="$TOKEN" vault kv get \
  -field=jwt_secret_key secret/trivia/backend-auth >/dev/null 2>&1
'; then
  fail_msg "PostgreSQL AppRole can read the JWT secret"
else
  pass "PostgreSQL AppRole cannot read the JWT secret"
fi

echo
echo "=== 7. Vault Agent JWT injection ==="
if dc exec -T backend python -c '
from pathlib import Path

for cmdline_path in Path("/proc").glob("[0-9]*/cmdline"):
    try:
        command = cmdline_path.read_bytes()
        if b"fastapi" not in command or b"app/main.py" not in command:
            continue

        environment = cmdline_path.with_name("environ").read_bytes().split(b"\0")
        values = [
            item.split(b"=", 1)[1]
            for item in environment
            if item.startswith(b"JWT_SECRET_KEY=")
        ]
        if len(values) != 1:
            continue

        key = values[0]
        valid = len(key) == 64 and all(char in b"0123456789abcdef" for char in key)
        raise SystemExit(0 if valid else 1)
    except (OSError, PermissionError):
        continue

raise SystemExit(1)
'; then
  pass "Vault Agent injected JWT_SECRET_KEY into FastAPI"
else
  fail_msg "FastAPI does not have a valid Vault-injected JWT_SECRET_KEY"
fi

echo
echo "=== 8. Docker metadata secrets ==="
backend_id="$(dc ps -q backend)"
postgres_id="$(dc ps -q postgres)"

if [ -n "$backend_id" ] && \
   ! docker inspect "$backend_id" \
     --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | \
     grep -Eq 'DATABASE_URL|POSTGRES_PASSWORD|JWT_SECRET_KEY'; then
  pass "backend Docker metadata has no database or JWT secret"
else
  fail_msg "backend metadata contains a secret or could not be checked"
fi

if [ -n "$postgres_id" ] && \
   ! docker inspect "$postgres_id" \
     --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | \
     grep -q 'POSTGRES_PASSWORD'; then
  pass "postgres Docker metadata has no database password"
else
  fail_msg "postgres metadata contains its password or could not be checked"
fi

echo
echo "=== FINAL RESULT ==="
if [ "$fail" -eq 0 ]; then
  echo "ALL TESTS PASSED"
  exit 0
else
  echo "ONE OR MORE TESTS FAILED"
  exit 1
fi
