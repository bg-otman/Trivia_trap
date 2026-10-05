FROM hashicorp/vault:2.1.1 AS vault-bin

FROM postgres:16-alpine

# pg_dump/pg_restore come from the official PostgreSQL image. Add only the
# Vault binary so Vault Agent can inject the database password at runtime.
COPY --from=vault-bin /bin/vault /usr/local/bin/vault
COPY backup.sh restore.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/restore.sh

ENTRYPOINT ["vault", "agent", "-config=/vault/agent.hcl"]
