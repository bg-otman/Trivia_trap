#!/bin/sh
set -eu

cd /app

uv run --no-sync python -m alembic upgrade head
uv run --no-sync python -m app.dataProcessing.seed_database

exec uv run --no-sync fastapi run app/main.py \
  --host 0.0.0.0 --port 8000