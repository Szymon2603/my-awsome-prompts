#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GENERATED_DIR="$PROJECT_ROOT/.opencode/generated"

usage() {
  echo "Usage: ./scripts/install.sh <skill|agent> <name> [--dry-run]"
  echo ""
  echo "Install generated skills or agents to OpenCode config"
  echo ""
  echo "Examples:"
  echo "  ./scripts/install.sh skill my-skill"
  echo "  ./scripts/install.sh agent my-agent"
  echo "  ./scripts/install.sh skill my-skill --dry-run"
  exit 1
}

install_skill() {
  local name="$1"
  local source="$GENERATED_DIR/skills/$name"
  local dest="${OPENCODE_SKILLS_DIR:-$HOME/.opencode/skills}/$name"
  
  if [ ! -d "$source" ]; then
    echo "Error: Skill '$name' not found in $source"
    echo "Available skills:"
    ls -la "$GENERATED_DIR/skills/" 2>/dev/null || echo "  No skills generated yet"
    exit 1
  fi
  
  echo "Installing skill '$name'..."
  echo "  Source: $source"
  echo "  Destination: $dest"
  
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY-RUN] Would copy files"
    return
  fi
  
  mkdir -p "$(dirname "$dest")"
  cp -r "$source" "$dest"
  echo "✓ Skill '$name' installed"
}

install_agent() {
  local name="$1"
  local source="$GENERATED_DIR/agents/$name"
  local dest="${OPENCODE_AGENTS_DIR:-$HOME/.opencode/agents}/$name"
  
  if [ ! -d "$source" ]; then
    echo "Error: Agent '$name' not found in $source"
    echo "Available agents:"
    ls -la "$GENERATED_DIR/agents/" 2>/dev/null || echo "  No agents generated yet"
    exit 1
  fi
  
  echo "Installing agent '$name'..."
  echo "  Source: $source"
  echo "  Destination: $dest"
  
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY-RUN] Would copy files"
    return
  fi
  
  mkdir -p "$(dirname "$dest")"
  cp -r "$source" "$dest"
  echo "✓ Agent '$name' installed"
}

DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    skill|agent)
      TYPE="$1"
      NAME="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Unknown option: $1"
      usage
      ;;
  esac
done

if [ -z "$TYPE" ] || [ -z "$NAME" ]; then
  usage
fi

case $TYPE in
  skill)
    install_skill "$NAME"
    ;;
  agent)
    install_agent "$NAME"
    ;;
esac
