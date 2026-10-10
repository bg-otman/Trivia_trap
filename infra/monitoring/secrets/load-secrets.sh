#!/bin/sh
set -eu

export VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"
APPROLE_DIR=/vault/approle
OUT_DIR=/run/monitoring-secrets

[ -s "$APPROLE_DIR/role-id" ] || { echo "Monitoring RoleID is missing" >&2; exit 1; }
[ -s "$APPROLE_DIR/secret-id" ] || { echo "Monitoring SecretID is missing" >&2; exit 1; }

ROLE_ID="$(cat "$APPROLE_DIR/role-id")"
SECRET_ID="$(cat "$APPROLE_DIR/secret-id")"

# Authenticate with the restricted monitoring AppRole. The token can only read
# the two secrets granted by monitoring-policy.hcl.
VAULT_TOKEN="$(vault write -field=token auth/approle/login \
  role_id="$ROLE_ID" secret_id="$SECRET_ID")"
export VAULT_TOKEN

mkdir -p "$OUT_DIR"
umask 077
vault kv get -field=password secret/trivia/postgres > "$OUT_DIR/postgres_password"
vault kv get -field=password secret/trivia/grafana > "$OUT_DIR/grafana_admin_password"

# Grafana and postgres_exporter run as non-root users, so the files are
# read-only but readable by the containers that receive this isolated volume.
chmod 0444 "$OUT_DIR/postgres_password" "$OUT_DIR/grafana_admin_password"

# The files are now available to the two monitoring services; the Vault token
# itself is no longer needed.
vault token revoke -self >/dev/null
unset VAULT_TOKEN ROLE_ID SECRET_ID

echo "Monitoring runtime secrets are ready."
