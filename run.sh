#!/bin/bash

CERT_DIR="./application/certs"
CERT_FILE="${CERT_DIR}/cert.pem"
KEY_FILE="${CERT_DIR}/key.pem"

start_gunicorn() {
  gunicorn -b 0.0.0.0:42068 -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 --certfile="$CERT_FILE" --keyfile="$KEY_FILE" run:app
}

if [[ -f "$CERT_FILE" && -f "$KEY_FILE" ]]; then
  echo "Both cert.pem and key.pem are present. Starting gunicorn."
  start_gunicorn
else
  echo "One or both of cert.pem and key.pem are missing. Generating new key and certificate pair."

  mkdir -p "$CERT_DIR"

  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$KEY_FILE" -out "$CERT_FILE" -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

  if [[ $? -eq 0 ]]; then
    echo "Successfully generated cert.pem and key.pem. Starting gunicorn."
    start_gunicorn
  else
    echo "Failed to generate cert.pem and key.pem."
    exit 1
  fi
fi
