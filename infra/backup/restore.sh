#!/bin/sh
set -eu

if [ "$#" -lt 1 ]; then
    echo "Usage: restore.sh <backup-file> [target-database]" >&2
    echo "Default target: ${POSTGRES_DB:-trivia_db}_restore_test" >&2
    exit 1
fi

BACKUP_FILE="$1"
TARGET_DB="${2:-${POSTGRES_DB}_restore_test}"
VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"
export VAULT_ADDR

# The backup file path can be absolute or relative to the /backups directory.
case "$BACKUP_FILE" in
    /*) ;;
    *) BACKUP_FILE="/backups/$BACKUP_FILE" ;;
esac

[ -f "$BACKUP_FILE" ] || {
    echo "Backup not found: $BACKUP_FILE" >&2
    exit 1
}

# If the target database is the same as the live database, require an explicit confirmation to avoid accidental data loss.
if [ "$TARGET_DB" = "$POSTGRES_DB" ] && [ "${CONFIRM_RESTORE:-}" != "YES" ]; then
    echo "Refusing to replace the live database without CONFIRM_RESTORE=YES." >&2
    exit 1
fi

# docker compose exec starts a new process, so it does not inherit the
# PGPASSWORD injected by Vault Agent into backup.sh. Authenticate to Vault here
# and keep the password only in this restore process.

TOKEN="$(vault write -field=token auth/approle/login \
    role_id="$(cat /vault/approle/role-id)" \
    secret_id="$(cat /vault/approle/secret-id)")"

DB_PASSWORD="$(VAULT_TOKEN="$TOKEN" vault kv get \
    -field=password secret/trivia/postgres)"

export PGPASSWORD="$DB_PASSWORD" # export the password for psql and pg_restore

# drop the target database if it exists, create a new one, and restore the backup into it.
dropdb -h postgres -U "$POSTGRES_USER" --if-exists "$TARGET_DB"
createdb -h postgres -U "$POSTGRES_USER" "$TARGET_DB"
pg_restore -h postgres -U "$POSTGRES_USER" -d "$TARGET_DB" "$BACKUP_FILE"

# check if we can connect to the target database and run a simple query after restore .
psql -h postgres -U "$POSTGRES_USER" -d "$TARGET_DB" \
    -tAc 'SELECT 1;' | grep -qx '1'

unset PGPASSWORD DB_PASSWORD TOKEN

echo "Restore completed successfully into database: $TARGET_DB"
