#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GENERATED_DIR="$PROJECT_ROOT/.opencode/generated"
OPENCODE_DIR="${OPENCODE_DIR:-$HOME/.opencode}"
SKILLS_DIR="${OPENCODE_SKILLS_DIR:-$OPENCODE_DIR/skills}"
AGENTS_DIR="${OPENCODE_AGENTS_DIR:-$OPENCODE_DIR/agents}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
  cat << EOF
Usage: ./scripts/install.sh <skill|agent> <name> [OPTIONS]

Install generated skills or agents to OpenCode config.

Commands:
  skill <name>   Install a skill
  agent <name>   Install an agent
  all            Install all skills and agents

Options:
  --dry-run      Preview changes without installing
  --force        Overwrite existing installations
  --validate     Run validation before install
  --backup       Create backup before installing
  --watch        Enable watch mode after install
  -h, --help     Show this help

Examples:
  ./scripts/install.sh skill my-skill
  ./scripts/install.sh agent my-agent
  ./scripts/install.sh all
  ./scripts/install.sh skill my-skill --dry-run --validate
EOF
  exit 1
}

check_dependencies() {
  local skill_dir="$1"
  local dependencies=$(grep -A 50 "^---$" "$skill_dir/SKILL.md" 2>/dev/null | grep -A 20 "^dependencies:" | tail -n +2 | grep -E "^\s+- " | sed 's/^\s*-\s*//')
  
  if [ -n "$dependencies" ]; then
    info "Checking dependencies..."
    for dep in $dependencies; do
      if command -v "$dep" &>/dev/null; then
        info "  ✓ $dep found"
      else
        warn "  ✗ $dep not found - may be required"
      fi
    done
  fi
}

validate_before_install() {
  local type="$1"
  local name="$2"
  local source=""
  
  if [ "$type" = "skill" ]; then
    source="$GENERATED_DIR/skills/$name"
  else
    source="$GENERATED_DIR/agents/$name"
  fi
  
  if [ ! -d "$source" ]; then
    error "Source not found: $source"
    return 1
  fi
  
  info "Validating $type: $name"
  if ! "$SCRIPT_DIR/validate.sh" "$type" "$source" &>/dev/null; then
    error "Validation failed for $name"
    return 1
  fi
  info "  ✓ Validation passed"
  
  return 0
}

create_backup() {
  local dest="$1"
  if [ -d "$dest" ]; then
    local backup="${dest}.backup.$(date +%Y%m%d_%H%M%S)"
    info "Creating backup: $backup"
    cp -r "$dest" "$backup"
  fi
}

merge_config() {
  local source="$1"
  local dest="$2"
  
  if [ -f "$source/config.json" ] && [ -d "$dest" ]; then
    warn "Config merge not implemented - manual config may be needed"
  fi
}

install_skill() {
  local name="$1"
  local source="$GENERATED_DIR/skills/$name"
  local dest="$SKILLS_DIR/$name"
  
  if [ ! -d "$source" ]; then
    error "Skill '$name' not found"
    info "Available skills:"
    ls -la "$GENERATED_DIR/skills/" 2>/dev/null || echo "  No skills generated yet"
    return 1
  fi
  
  info "Installing skill: $name"
  echo "  Source: $source"
  echo "  Destination: $dest"
  
  if [ -d "$dest" ] && [ "$FORCE" != "true" ]; then
    warn "Skill already installed. Use --force to overwrite."
    return 1
  fi
  
  if [ "$DRY_RUN" = "true" ]; then
    info "[DRY-RUN] Would install skill '$name'"
    return 0
  fi
  
  if [ "$VALIDATE" = "true" ]; then
    if ! validate_before_install "skill" "$name"; then
      return 1
    fi
  fi
  
  if [ "$BACKUP" = "true" ]; then
    create_backup "$dest"
  fi
  
  if [ "$WATCH" = "true" ]; then
    info "Setting up watch for: $dest"
    mkdir -p "$OPENCODE_DIR/.watch"
    echo "$dest" >> "$OPENCODE_DIR/.watch/skills.txt"
  fi
  
  mkdir -p "$(dirname "$dest")"
  rm -rf "$dest"
  cp -r "$source" "$dest"
  
  info "✓ Skill '$name' installed successfully"
  
  if [ -f "$dest/SKILL.md" ]; then
    check_dependencies "$dest"
  fi
}

install_agent() {
  local name="$1"
  local source="$GENERATED_DIR/agents/$name"
  local dest="$AGENTS_DIR/$name"
  
  if [ ! -d "$source" ]; then
    error "Agent '$name' not found"
    info "Available agents:"
    ls -la "$GENERATED_DIR/agents/" 2>/dev/null || echo "  No agents generated yet"
    return 1
  fi
  
  info "Installing agent: $name"
  echo "  Source: $source"
  echo "  Destination: $dest"
  
  if [ -d "$dest" ] && [ "$FORCE" != "true" ]; then
    warn "Agent already installed. Use --force to overwrite."
    return 1
  fi
  
  if [ "$DRY_RUN" = "true" ]; then
    info "[DRY-RUN] Would install agent '$name'"
    return 0
  fi
  
  if [ "$VALIDATE" = "true" ]; then
    if ! validate_before_install "agent" "$name"; then
      return 1
    fi
  fi
  
  if [ "$BACKUP" = "true" ]; then
    create_backup "$dest"
  fi
  
  mkdir -p "$(dirname "$dest")"
  rm -rf "$dest"
  cp -r "$source" "$dest"
  
  info "✓ Agent '$name' installed successfully"
}

install_all() {
  local errors=0
  
  info "Installing all skills..."
  for skill_path in "$GENERATED_DIR/skills"/*; do
    if [ -d "$skill_path" ]; then
      local name=$(basename "$skill_path")
      install_skill "$name" || ((errors++))
    fi
  done
  
  info "Installing all agents..."
  for agent_path in "$GENERATED_DIR/agents"/*; do
    if [ -d "$agent_path" ]; then
      local name=$(basename "$agent_path")
      install_agent "$name" || ((errors++))
    fi
  done
  
  if [ $errors -gt 0 ]; then
    error "$errors installation(s) failed"
    return 1
  fi
  
  info "✓ All installations completed"
}

DRY_RUN="false"
FORCE="false"
VALIDATE="false"
BACKUP="false"
WATCH="false"

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --force)
      FORCE="true"
      shift
      ;;
    --validate)
      VALIDATE="true"
      shift
      ;;
    --backup)
      BACKUP="true"
      shift
      ;;
    --watch)
      WATCH="true"
      shift
      ;;
    -h|--help)
      usage
      ;;
    skill|agent|all)
      TYPE="$1"
      if [ "$1" = "all" ]; then
        shift
      else
        NAME="$2"
        shift 2
      fi
      ;;
    *)
      error "Unknown option: $1"
      usage
      ;;
  esac
done

if [ -z "$TYPE" ]; then
  usage
fi

case $TYPE in
  skill)
    install_skill "$NAME"
    ;;
  agent)
    install_agent "$NAME"
    ;;
  all)
    install_all
    ;;
esac
