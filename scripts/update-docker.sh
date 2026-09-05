#!/usr/bin/env bash

# Rebuild only the existing application container after a successful push.
# This script intentionally leaves database and Redis services/volumes alone.

set -u

log() {
  printf '[accurate-medical-center] %s\n' "$*"
}

fail() {
  log "ERROR: $*" >&2
  exit 1
}

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)" || fail "Unable to locate the script directory."
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)" || fail "Unable to locate the repository root."
cd -- "$REPO_ROOT" || fail "Unable to change to repository root: $REPO_ROOT"

log "Repository root: $REPO_ROOT"

command -v docker >/dev/null 2>&1 || fail "Docker CLI is not available on PATH."

COMPOSE_CMD=()
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  if docker-compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker-compose)
  else
    fail "Docker Compose was found but could not be executed."
  fi
else
  fail "Docker Compose is not available (expected 'docker compose' or 'docker-compose')."
fi

if ! docker info >/dev/null 2>&1; then
  fail "Docker is unavailable or the Docker daemon is not running."
fi

COMPOSE_FILE=""
for candidate in docker-compose.yml docker-compose.yaml compose.yml compose.yaml; do
  if [[ -f "$candidate" ]]; then
    COMPOSE_FILE="$candidate"
    break
  fi
done

[[ -n "$COMPOSE_FILE" ]] || fail "No Docker Compose configuration was found at the repository root."
log "Compose file: $COMPOSE_FILE"

if ! SERVICES="$("${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" config --services)"; then
  fail "Unable to validate the existing Docker Compose configuration."
fi

APPLICATION_SERVICE="web"
if ! printf '%s\n' "$SERVICES" | grep -Fxq "$APPLICATION_SERVICE"; then
  fail "The inspected Compose configuration does not contain the expected application service '$APPLICATION_SERVICE'; no container was changed."
fi

log "Compose services detected: $(printf '%s' "$SERVICES" | tr '\n' ' ')"
log "Rebuilding and restarting application service: $APPLICATION_SERVICE"

"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" up -d --build --no-deps "$APPLICATION_SERVICE"
UPDATE_STATUS=$?

log "Final container state:"
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" ps
PS_STATUS=$?

if [[ "$UPDATE_STATUS" -ne 0 ]]; then
  fail "Docker update failed with exit status $UPDATE_STATUS."
fi

if [[ "$PS_STATUS" -ne 0 ]]; then
  fail "Unable to display the final Docker Compose state (exit status $PS_STATUS)."
fi

log "Docker update completed successfully. Database and Redis services were not rebuilt or removed."
