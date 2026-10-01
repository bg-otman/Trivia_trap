pid_file = "/tmp/vault-agent.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"

    config = {
      role_id_file_path                   = "/vault/approle/role-id"
      secret_id_file_path                 = "/vault/approle/secret-id"
      remove_secret_id_file_after_reading = false
    }
  }
}

template_config {
  static_secret_render_interval = "5m"
  exit_on_retry_failure         = true
}

# Vault Agent injects POSTGRES_PASSWORD only into the child process. It is not
# present in compose.yaml, Docker inspect configuration, or a persistent file.

env_template "POSTGRES_PASSWORD" {
  contents             = "{{ with secret \"secret/data/trivia/postgres\" }}{{ .Data.data.password }}{{ end }}"
  error_on_missing_key = true
}

exec {
  command                   = ["/usr/local/bin/docker-entrypoint.sh", "postgres"]
  restart_on_secret_changes = "never"
  restart_stop_signal       = "SIGTERM"
}
