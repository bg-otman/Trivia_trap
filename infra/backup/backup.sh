#!/bin/sh
set -eu

: "${PGPASSWORD:?Vault Agent did not inject PGPASSWORD}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"

BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-3600}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
BACKUP_MAX_AGE_SECONDS="${BACKUP_MAX_AGE_SECONDS:-7200}"
BACKUP_DIR=/backups

mkdir -p "$BACKUP_DIR"

write_status() {
    status="$1"
    last_success="$2"
    backup_name="$3"
    message="$4"

    cat > "$BACKUP_DIR/status.json.tmp" <<EOF
{"status":"$status","last_success":$last_success,"backup":"$backup_name","max_age_seconds":$BACKUP_MAX_AGE_SECONDS,"message":"$message"}
EOF
    mv "$BACKUP_DIR/status.json.tmp" "$BACKUP_DIR/status.json"
}

while true; do
    timestamp="$(date -u +%Y%m%d_%H%M%S)"
    backup_name="trivia_${timestamp}.dump"
    backup_file="$BACKUP_DIR/$backup_name"

    echo "Creating PostgreSQL backup: $backup_name"

    if pg_dump \
        -h postgres \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -Fc \
        -f "$backup_file"; then

        now="$(date +%s)"
        printf '%s\n' "$now" > "$BACKUP_DIR/last_success"
        # Update status.json to indicate the backup was successful.
        write_status "operational" "$now" "$backup_name" "Latest backup completed successfully"

        # Keep backups for the configured number of days.
        find "$BACKUP_DIR" -type f -name 'trivia_*.dump' \
            -mtime "+$BACKUP_RETENTION_DAYS" -exec rm -f {} \;

        echo "Backup completed: $backup_name"
    else
        rm -f "$backup_file"
        last_success="$(cat "$BACKUP_DIR/last_success" 2>/dev/null || printf '0')"
        write_status "degraded" "$last_success" "" "Latest backup attempt failed"
        echo "Backup failed" >&2
    fi

    sleep "$BACKUP_INTERVAL_SECONDS"
done


# Vault Agent injects PGPASSWORD
#         ↓
# backup.sh starts
#         ↓
# pg_dump PostgreSQL
#         ↓
# /backups/trivia_TIMESTAMP.dump
#         ↓
# update last_success + status.json
#         ↓
# delete old dumps
#         ↓
# sleep 1 hour
#         ↓
# repeat