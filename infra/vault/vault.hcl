ui = false

# Raft integrated storage is HashiCorp's recommended storage backend for most
# self-hosted Vault deployments. Vault encrypts the data before it reaches this storage volume.

storage "raft" {
  path    = "/vault/file"
  node_id = "trivia-vault-1"
}

# Vault is reachable only on the Docker network; it is not published to the
# host. The project subject allows unencrypted communication between internal
# services, so TLS terminates at Nginx rather than being duplicated here.

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = true
}

api_addr     = "http://vault:8200"
cluster_addr = "http://vault:8201"

# HashiCorp recommends disabling mlock when using Integrated Storage (Raft).
# This also keeps the configuration compatible with the school's rootless Docker environment.

disable_mlock = true
