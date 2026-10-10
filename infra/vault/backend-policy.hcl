# KV v2 ACL paths include the /data/ segment. The backend needs the database
# credential and its own authentication secrets, but no other Vault data.

path "secret/data/trivia/postgres" {
  capabilities = ["read"]
}

path "secret/data/trivia/backend-auth" {
  capabilities = ["read"]
}

# Allow Vault Agent to renew its own token.
path "auth/token/renew-self" {
  capabilities = ["update"]
}
