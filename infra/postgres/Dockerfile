FROM hashicorp/vault:2.1.1 AS vault-bin

FROM postgres:16-alpine

# Keep the official PostgreSQL image and add only the Vault binary. Vault Agent
# becomes the supervisor and launches the original PostgreSQL entrypoint after
# it has authenticated and injected POSTGRES_PASSWORD.
COPY --from=vault-bin /bin/vault /usr/local/bin/vault

ENTRYPOINT ["vault", "agent", "-config=/vault/agent.hcl"]
