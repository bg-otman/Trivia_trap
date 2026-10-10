# Monitoring needs PostgreSQL credentials for postgres_exporter and the
# Grafana admin password. It cannot write or administer Vault.
path "secret/data/trivia/postgres" {
  capabilities = ["read"]
}

path "secret/data/trivia/grafana" {
  capabilities = ["read"]
}

# The one-shot monitoring setup may revoke its own token after loading secrets.
path "auth/token/revoke-self" {
  capabilities = ["update"]
}