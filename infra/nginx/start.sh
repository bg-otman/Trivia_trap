#!/bin/sh
set -eu

CERT_DIR=/etc/nginx/certs
CERT_FILE="$CERT_DIR/trivia.crt"
KEY_FILE="$CERT_DIR/trivia.key"

mkdir -p "$CERT_DIR"

# local development certificate. The named Docker volume keeps it between
# container recreations. Production can replace these files with real certs.
if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    openssl req \
        -x509 \
        -nodes \
        -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -days 365 \
        -subj "/CN=trivia-trap.local/O=Trivia Trap/OU=ft_transcendence" \
        -addext "subjectAltName=DNS:trivia-trap.local,DNS:localhost,IP:127.0.0.1"
    chmod 600 "$KEY_FILE"
fi

# The OWASP image's original entrypoint generates the ModSecurity/CRS and
# Nginx configuration from its environment before starting Nginx.
export SSL_CERT_FILE="$CERT_FILE"
export SSL_CERT_KEY_FILE="$KEY_FILE"
exec /docker-entrypoint.sh "$@"
