#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
exec uv run --locked --group dev python -m achievement_lab.manage "$@"
