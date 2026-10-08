# KV v2 ACL paths include the /data/ segment. Each application AppRole is intentionally limited to this single database-secret path.

path "secret/data/trivia/postgres" {
  capabilities = ["read"]
}
