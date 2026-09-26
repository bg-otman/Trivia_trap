#!/usr/bin/env bash

set -Eeuo pipefail

CONTAINER_NAME="trivia_postgres"
VOLUME_NAME="trivia_pgdata"
POSTGRES_IMAGE="postgres:16-alpine"
POSTGRES_USER="admin"
POSTGRES_PASSWORD="admin"
POSTGRES_DB="trivia_db"
HOST_PORT="54320"

cd "$(dirname "${BASH_SOURCE[0]}")/.."

command -v docker >/dev/null 2>&1 || {
    echo "Docker is not installed"
    exit 1
}

command -v uv >/dev/null 2>&1 || {
    echo "uv is not installed"
    exit 1
}

docker volume create "$VOLUME_NAME" >/dev/null

if docker container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
    DATA_MOUNT_TYPE="$(docker inspect \
        -f '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql/data"}}{{.Type}}{{end}}{{end}}' \
        "$CONTAINER_NAME")"

    if [[ "$DATA_MOUNT_TYPE" != "volume" ]]; then
        echo "Existing PostgreSQL container does not use a Docker volume"
        exit 1
    fi

    if [[ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME")" != "true" ]]; then
        docker start "$CONTAINER_NAME" >/dev/null
    fi
else
    docker run -d \
        --name "$CONTAINER_NAME" \
        -e POSTGRES_USER="$POSTGRES_USER" \
        -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
        -e POSTGRES_DB="$POSTGRES_DB" \
        -p "127.0.0.1:${HOST_PORT}:5432" \
        -v "${VOLUME_NAME}:/var/lib/postgresql/data" \
        "$POSTGRES_IMAGE" >/dev/null
fi

echo "Waiting for PostgreSQL..."
DATABASE_READY=0

for _ in $(seq 1 30); do
    if docker exec "$CONTAINER_NAME" \
        pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1
    then
        DATABASE_READY=1
        break
    fi

    sleep 1
done

if [[ "$DATABASE_READY" -ne 1 ]]; then
    echo "PostgreSQL did not become ready"
    docker logs --tail 50 "$CONTAINER_NAME"
    exit 1
fi

echo "Synchronizing dependencies..."
uv sync --frozen

echo "Applying database migrations..."
uv run --no-sync python -m alembic upgrade head

echo "Importing categories and questions..."
uv run python -m app.dataProcessing.seed_database

echo "Checking the database schema..."
uv run --no-sync python -m alembic current
uv run --no-sync python -m alembic check

echo "Database content:"
docker exec "$CONTAINER_NAME" \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT
    (SELECT COUNT(*) FROM categories) AS categories,
    (SELECT COUNT(*) FROM category_translations) AS translations,
    (SELECT COUNT(*) FROM questions) AS questions,
    (SELECT COUNT(*) FROM question_decoys) AS decoys;
"

echo "Local database is ready."
