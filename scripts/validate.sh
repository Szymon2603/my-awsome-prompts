#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SCHEMAS_DIR="$PROJECT_ROOT/schemas"

usage() {
  echo "Usage: ./scripts/validate.sh <skill|agent|all> <path>"
  echo ""
  echo "Validate skill or agent definitions against schemas"
  echo ""
  echo "Examples:"
  echo "  ./scripts/validate.sh skill skills/my-skill/SKILL.md"
  echo "  ./scripts/validate.sh agent agents/my-agent/AGENT.md"
  echo "  ./scripts/validate.sh all .opencode/"
  exit 1
}

validate_yaml() {
  local file="$1"
  
  if ! command -v python3 &> /dev/null; then
    echo "Warning: python3 not found, skipping YAML validation"
    return 0
  fi
  
  python3 -c "
import yaml
import sys
try:
    with open('$file', 'r') as f:
        # Split frontmatter
        content = f.read()
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                yaml.safe_load(parts[1])
except Exception as e:
    print(f'YAML Error: {e}')
    sys.exit(1)
"
}

validate_skill() {
  local path="$1"
  local skill_file="$path/SKILL.md"
  
  echo "Validating skill: $path"
  
  if [ ! -f "$skill_file" ]; then
    echo "  ✗ SKILL.md not found"
    return 1
  fi
  
  echo "  ✓ SKILL.md exists"
  
  # Basic frontmatter check
  if ! head -1 "$skill_file" | grep -q "^---"; then
    echo "  ✗ Missing frontmatter delimiter"
    return 1
  fi
  
  echo "  ✓ Frontmatter delimiter present"
  
  # Extract and validate name
  local name=$(sed -n '/^name:/p' "$skill_file" | head -1 | sed 's/name: *//' | tr -d ' ')
  if [ -z "$name" ]; then
    echo "  ✗ Missing required field: name"
    return 1
  fi
  
  echo "  ✓ name: $name"
  
  # Check description
  if ! grep -q "^description:" "$skill_file"; then
    echo "  ✗ Missing required field: description"
    return 1
  fi
  
  echo "  ✓ description present"
  
  echo "  ✓ Skill validation passed"
  return 0
}

validate_agent() {
  local path="$1"
  local agent_file="$path/AGENT.md"
  
  echo "Validating agent: $path"
  
  if [ ! -f "$agent_file" ]; then
    echo "  ✗ AGENT.md not found"
    return 1
  fi
  
  echo "  ✓ AGENT.md exists"
  
  # Basic frontmatter check
  if ! head -1 "$agent_file" | grep -q "^---"; then
    echo "  ✗ Missing frontmatter delimiter"
    return 1
  fi
  
  echo "  ✓ Frontmatter delimiter present"
  
  # Extract and validate name
  local name=$(sed -n '/^name:/p' "$agent_file" | head -1 | sed 's/name: *//' | tr -d ' ')
  if [ -z "$name" ]; then
    echo "  ✗ Missing required field: name"
    return 1
  fi
  
  echo "  ✓ name: $name"
  
  # Check description
  if ! grep -q "^description:" "$agent_file"; then
    echo "  ✗ Missing required field: description"
    return 1
  fi
  
  echo "  ✓ description present"
  
  # Check type
  if ! grep -q "^type:" "$agent_file"; then
    echo "  ✗ Missing required field: type"
    return 1
  fi
  
  echo "  ✓ type present"
  
  echo "  ✓ Agent validation passed"
  return 0
}

validate_all() {
  local base_path="$1"
  local errors=0
  
  echo "Validating all skills and agents in: $base_path"
  echo ""
  
  # Validate skills
  if [ -d "$base_path/skills" ]; then
    for skill_path in "$base_path/skills"/*; do
      if [ -d "$skill_path" ] && [ -f "$skill_path/SKILL.md" ]; then
        validate_skill "$skill_path" || ((errors++))
        echo ""
      fi
    done
  fi
  
  # Validate agents
  if [ -d "$base_path/agents" ]; then
    for agent_path in "$base_path/agents"/*; do
      if [ -d "$agent_path" ] && [ -f "$agent_path/AGENT.md" ]; then
        validate_agent "$agent_path" || ((errors++))
        echo ""
      fi
    done
  fi
  
  if [ $errors -eq 0 ]; then
    echo "✓ All validations passed"
    return 0
  else
    echo "✗ $errors validation(s) failed"
    return 1
  fi
}

TYPE="$1"
PATH="$2"

if [ -z "$TYPE" ] || [ -z "$PATH" ]; then
  usage
fi

case $TYPE in
  skill)
    validate_skill "$PATH"
    ;;
  agent)
    validate_agent "$PATH"
    ;;
  all)
    validate_all "$PATH"
    ;;
  -h|--help)
    usage
    ;;
  *)
    echo "Unknown type: $TYPE"
    usage
    ;;
esac
