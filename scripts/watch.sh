#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OPENCODE_DIR="${OPENCODE_DIR:-$HOME/.opencode}"
WATCH_DIR="$OPENCODE_DIR/.watch"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
notify() { echo -e "${BLUE}[NOTIFY]${NC} $1"; }

usage() {
  cat << EOF
Usage: ./scripts/watch.sh [OPTIONS]

Watch skills and agents for changes and reload automatically.

Options:
  --skills    Watch skills directory only
  --agents    Watch agents directory only
  --all       Watch both (default)
  --daemon    Run as background daemon
  --notify    Send desktop notifications (requires notify-send)
  --interval  Check interval in seconds (default: 2)
  -h, --help  Show this help

Examples:
  ./scripts/watch.sh                    # Watch all
  ./scripts/watch.sh --skills          # Watch skills only
  ./scripts/watch.sh --daemon --notify # Background with notifications
EOF
  exit 1
}

WATCH_SKILLS="true"
WATCH_AGENTS="true"
DAEMON="false"
NOTIFY="false"
INTERVAL=2
LAST_HASH=""

calculate_hash() {
  local hash=""
  
  if [ "$WATCH_SKILLS" = "true" ]; then
    hash="$hash skills:$(find "$OPENCODE_DIR/skills" -type f -name "*.md" -exec cat {} \; 2>/dev/null | md5sum | cut -d' ' -f1)"
  fi
  
  if [ "$WATCH_AGENTS" = "true" ]; then
    hash="$hash agents:$(find "$OPENCODE_DIR/agents" -type f -name "*.md" -exec cat {} \; 2>/dev/null | md5sum | cut -d' ' -f1)"
  fi
  
  echo "$hash"
}

reload_opencode() {
  info "Changes detected - reloading OpenCode..."
  
  if [ "$NOTIFY" = "true" ] && command -v notify-send &>/dev/null; then
    notify-send "OpenCode" "Reloading skills and agents..."
  fi
  
  if command -v pkill &>/dev/null; then
    pkill -f "opencode" 2>/dev/null || true
    sleep 1
  fi
  
  info "✓ OpenCode reloaded"
  
  if [ "$NOTIFY" = "true" ] && command -v notify-send &>/dev/null; then
    notify-send "OpenCode" "Skills and agents reloaded successfully"
  fi
}

watch_loop() {
  info "Starting watch loop (interval: ${INTERVAL}s)"
  info "Press Ctrl+C to stop"
  
  LAST_HASH=$(calculate_hash)
  
  while true; do
    sleep "$INTERVAL"
    
    local current_hash=$(calculate_hash)
    
    if [ "$current_hash" != "$LAST_HASH" ]; then
      LAST_HASH="$current_hash"
      reload_opencode
    fi
  done
}

setup_watch_files() {
  if [ ! -f "$WATCH_DIR/skills.txt" ]; then
    mkdir -p "$WATCH_DIR"
    find "$OPENCODE_DIR/skills" -maxdepth 2 -name "SKILL.md" 2>/dev/null | xargs -I {} dirname {} > "$WATCH_DIR/skills.txt"
  fi
  
  if [ ! -f "$WATCH_DIR/agents.txt" ]; then
    mkdir -p "$WATCH_DIR"
    find "$OPENCODE_DIR/agents" -maxdepth 2 -name "AGENT.md" 2>/dev/null | xargs -I {} dirname {} > "$WATCH_DIR/agents.txt"
  fi
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --skills)
      WATCH_AGENTS="false"
      shift
      ;;
    --agents)
      WATCH_SKILLS="false"
      shift
      ;;
    --all)
      WATCH_SKILLS="true"
      WATCH_AGENTS="true"
      shift
      ;;
    --daemon)
      DAEMON="true"
      shift
      ;;
    --notify)
      NOTIFY="true"
      shift
      ;;
    --interval)
      INTERVAL="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      error "Unknown option: $1"
      usage
      ;;
  esac
done

if [ ! -d "$OPENCODE_DIR" ]; then
  error "OpenCode directory not found: $OPENCODE_DIR"
  exit 1
fi

setup_watch_files

if [ "$DAEMON" = "true" ]; then
  info "Starting watch as daemon..."
  watch_loop &>/dev/null &
  echo $! > "$WATCH_DIR/watch.pid"
  info "Daemon started (PID: $(cat "$WATCH_DIR/watch.pid"))"
else
  watch_loop
fi
