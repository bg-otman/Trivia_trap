FROM hashicorp/vault:2.1.1 AS vault-bin

FROM python:3.13-slim

WORKDIR /app

RUN pip install --no-cache-dir uv

# Vault Agent supervises FastAPI and injects DATABASE_URL at process start.
COPY --from=vault-bin /bin/vault /usr/local/bin/vault

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./

EXPOSE 8000

ENTRYPOINT ["vault", "agent", "-config=/vault/agent.hcl"]
