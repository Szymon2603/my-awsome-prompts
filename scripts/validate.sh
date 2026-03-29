#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PARSE_SCRIPT="$SCRIPT_DIR/parse_frontmatter.js"
SCHEMAS_DIR="$PROJECT_ROOT/schemas"
NODE_BIN="$(command -v node)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARNINGS=0

pass() { echo -e "${GREEN}✓${NC} $1"; ((PASS++)); }
fail() { echo -e "${RED}✗${NC} $1"; ((FAIL++)); }
warn() { echo -e "${YELLOW}!${NC} $1"; ((WARNINGS++)); }
info() { echo "  $1"; }

usage() {
  cat << EOF
Usage: ./scripts/validate.sh <skill|agent|all> <path> [OPTIONS]

Validate skill or agent definitions against schemas.

Commands:
  skill <path>   Validate a skill directory
  agent <path>   Validate an agent directory
  all <path>     Validate all skills and agents in directory

Options:
  --strict       Treat warnings as errors
  --json         Output results as JSON
  -h, --help     Show this help

Examples:
  ./scripts/validate.sh skill skills/my-skill
  ./scripts/validate.sh agent agents/my-agent
  ./scripts/validate.sh all .opencode/
EOF
  exit 1
}

parse_frontmatter() {
  local file="$1"
  if [ -f "$PARSE_SCRIPT" ] && [ -n "$NODE_BIN" ]; then
    "$NODE_BIN" "$PARSE_SCRIPT" "$file" 2>/dev/null || echo "{}"
  else
    echo "{}"
  fi
}

get_field() {
  local file="$1"
  local field="$2"
  if [ -f "$PARSE_SCRIPT" ] && [ -n "$NODE_BIN" ]; then
    "$NODE_BIN" "$PARSE_SCRIPT" "$file" "$field" 2>/dev/null || echo ""
  else
    echo ""
  fi
}

validate_name() {
  local name="$1"
  local type="$2"
  
  if [ -z "$name" ]; then
    fail "Missing required field: name"
    return 1
  fi
  
  if ! echo "$name" | grep -qE "^[a-z][a-z0-9-]*$"; then
    fail "Invalid name format: '$name' (use lowercase, hyphens only)"
    return 1
  fi
  
  if [ ${#name} -gt 64 ]; then
    fail "Name too long: ${#name} chars (max: 64)"
    return 1
  fi
  
  pass "name: $name"
  return 0
}

validate_description() {
  local desc="$1"
  
  if [ -z "$desc" ]; then
    fail "Missing required field: description"
    return 1
  fi
  
  if [ ${#desc} -gt 1024 ]; then
    fail "Description too long: ${#desc} chars (max: 1024)"
    return 1
  fi
  
  pass "description present (${#desc} chars)"
  return 0
}

validate_tools() {
  local tools="$1"
  
  if [ -z "$tools" ]; then
    warn "No tools specified (will use defaults)"
    return 0
  fi
  
  local valid_tools="Read Grep Glob Bash Edit Write WebFetch WebSearch TodoWrite Task"
  local invalid=""
  
  for tool in $tools; do
    if ! echo "$valid_tools" | grep -qw "$tool"; then
      invalid="$invalid $tool"
    fi
  done
  
  if [ -n "$invalid" ]; then
    fail "Invalid tools:$invalid"
    return 1
  fi
  
  pass "tools: $tools"
  return 0
}

validate_skill() {
  local path="$1"
  local skill_file="$path/SKILL.md"
  local errors=0
  
  echo "Validating skill: $path"
  
  if [ ! -f "$skill_file" ]; then
    fail "SKILL.md not found"
    return 1
  fi
  info "SKILL.md exists"
  
  if ! /usr/bin/head -1 "$skill_file" | /usr/bin/grep -q "^---"; then
    fail "Missing frontmatter delimiter"
    ((errors++))
  fi
  
  local fm=$(parse_frontmatter "$skill_file")
  local name=$(get_field "$skill_file" "name")
  local desc=$(get_field "$skill_file" "description")
  local tools=$(get_field "$skill_file" "allowed-tools")
  
  if ! validate_name "$name" "skill"; then
    ((errors++))
  fi
  
  if ! validate_description "$desc"; then
    ((errors++))
  fi
  
  if ! validate_tools "$tools"; then
    ((errors++))
  fi
  
  local effort=$(get_field "$skill_file" "effort")
  if [ -n "$effort" ]; then
    if echo "$effort" | grep -qvE "^(low|medium|high|max)$"; then
      fail "Invalid effort: $effort"
      ((errors++))
    else
      pass "effort: $effort"
    fi
  fi
  
  local context=$(get_field "$skill_file" "context")
  if [ -n "$context" ]; then
    if echo "$context" | grep -qvE "^(fork|inline)$"; then
      fail "Invalid context: $context"
      ((errors++))
    else
      pass "context: $context"
    fi
  fi
  
  if [ $errors -eq 0 ]; then
    pass "Skill validation passed"
    return 0
  else
    fail "Skill validation failed ($errors errors)"
    return 1
  fi
}

validate_agent() {
  local path="$1"
  local agent_file="$path/AGENT.md"
  local errors=0
  
  echo "Validating agent: $path"
  
  if [ ! -f "$agent_file" ]; then
    fail "AGENT.md not found"
    return 1
  fi
  info "AGENT.md exists"
  
  if ! /usr/bin/head -1 "$agent_file" | /usr/bin/grep -q "^---"; then
    fail "Missing frontmatter delimiter"
    ((errors++))
  fi
  
  local fm=$(parse_frontmatter "$agent_file")
  local name=$(get_field "$agent_file" "name")
  local desc=$(get_field "$agent_file" "description")
  local type=$(get_field "$agent_file" "type")
  local tools=$(get_field "$agent_file" "allowed-tools")
  
  if ! validate_name "$name" "agent"; then
    ((errors++))
  fi
  
  if ! validate_description "$desc"; then
    ((errors++))
  fi
  
  if [ -z "$type" ]; then
    fail "Missing required field: type"
    ((errors++))
  elif ! echo "$type" | grep -qE "^(explorer|planner|general|custom)$"; then
    fail "Invalid type: $type"
    ((errors++))
  else
    pass "type: $type"
  fi
  
  if ! validate_tools "$tools"; then
    ((errors++))
  fi
  
  if [ $errors -eq 0 ]; then
    pass "Agent validation passed"
    return 0
  else
    fail "Agent validation failed ($errors errors)"
    return 1
  fi
}

validate_all() {
  local base_path="$1"
  local errors=0
  
  echo "Validating all in: $base_path"
  echo "================================"
  
  if [ -d "$base_path/skills" ]; then
    echo ""
    echo "Skills:"
    for skill_path in "$base_path/skills"/*; do
      if [ -d "$skill_path" ]; then
        validate_skill "$skill_path" || ((errors++))
        echo ""
      fi
    done
  fi
  
  if [ -d "$base_path/agents" ]; then
    echo ""
    echo "Agents:"
    for agent_path in "$base_path/agents"/*; do
      if [ -d "$agent_path" ]; then
        validate_agent "$agent_path" || ((errors++))
        echo ""
      fi
    done
  fi
  
  echo "================================"
  echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$WARNINGS warnings${NC}"
  
  if [ $errors -eq 0 ]; then
    pass "All validations passed"
    return 0
  else
    fail "$errors validation(s) failed"
    return 1
  fi
}

STRICT="false"
JSON_OUTPUT="false"

while [[ $# -gt 0 ]]; do
  case $1 in
    --strict)
      STRICT="true"
      shift
      ;;
    --json)
      JSON_OUTPUT="true"
      shift
      ;;
    skill|agent|all)
      TYPE="$1"
      if [ -n "$2" ] && [[ ! "$2" =~ ^-- ]]; then
        TARGET="$2"
        shift 2
      else
        shift
      fi
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

if [ -z "$TYPE" ] || [ -z "$TARGET" ]; then
  usage
fi

if [ -z "$NODE_BIN" ]; then
  warn "node not found - YAML parsing disabled"
fi

case $TYPE in
  skill)
    validate_skill "$TARGET"
    ;;
  agent)
    validate_agent "$TARGET"
    ;;
  all)
    validate_all "$TARGET"
    ;;
esac
