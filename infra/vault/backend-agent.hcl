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

# Process Supervisor Mode injects the secret directly into FastAPI's process
# environment. No plaintext DATABASE_URL file is persisted in a Docker volume.

env_template "DATABASE_URL" {
  contents             = "{{ with secret \"secret/data/trivia/postgres\" }}postgresql+asyncpg://{{ env \"POSTGRES_USER\" }}:{{ .Data.data.password }}@postgres:5432/{{ env \"POSTGRES_DB\" }}{{ end }}"
  error_on_missing_key = true
}

exec {
  command = [
    "/usr/local/bin/uv",
    "run",
    "fastapi",
    "run",
    "app/main.py",
    "--host",
    "0.0.0.0",
    "--port",
    "8000",
  ]

  # Changing the PostgreSQL superuser password requires a coordinated database
  # rotation, not merely restarting FastAPI with a different environment value.

  restart_on_secret_changes = "never"
  restart_stop_signal       = "SIGTERM"
}
