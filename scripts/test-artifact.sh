#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GENERATED_DIR="$PROJECT_ROOT/.opencode/generated"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
success() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }

usage() {
  cat << EOF
Usage: ./scripts/test-artifact.sh <skill|agent|prompt> <name>

Test generated artifacts before installation.

Commands:
  skill <name>   Test a skill
  agent <name>   Test an agent
  prompt <name>  Test a prompt

Options:
  -h, --help     Show this help
  --verbose      Show detailed output

Examples:
  ./scripts/test-artifact.sh skill my-skill
  ./scripts/test-artifact.sh agent java-app-generator
  ./scripts/test-artifact.sh prompt code-review
EOF
  exit 1
}

VERBOSE="false"

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      usage
      ;;
    --verbose)
      VERBOSE="true"
      shift
      ;;
    skill|agent|prompt)
      TYPE="$1"
      NAME="$2"
      shift 2
      ;;
    *)
      error "Unknown option: $1"
      usage
      ;;
  esac
done

if [ -z "$TYPE" ] || [ -z "$NAME" ]; then
  error "Missing type or name"
  usage
fi

case $TYPE in
  skill)
    SOURCE="$GENERATED_DIR/skills/$NAME"
    ;;
  agent)
    SOURCE="$GENERATED_DIR/agents/$NAME"
    ;;
  prompt)
    SOURCE="$GENERATED_DIR/prompts/$NAME.md"
    ;;
esac

info "Testing $TYPE: $NAME"
echo "  Source: $SOURCE"

if [ ! -e "$SOURCE" ]; then
  error "Artifact not found: $SOURCE"
  exit 1
fi

echo ""
info "Running tests..."

TOTAL=0
PASSED=0
FAILED=0

if [ "$TYPE" = "skill" ] || [ "$TYPE" = "agent" ]; then
  MAIN_FILE="$SOURCE/${TYPE^}.md"
  
  if [ -f "$MAIN_FILE" ]; then
    ((TOTAL++))
    if grep -q "^---" "$MAIN_FILE" && grep -q "^name:" "$MAIN_FILE"; then
      ((PASSED++))
      success "Frontmatter present"
    else
      ((FAILED++))
      fail "Frontmatter missing or invalid"
    fi
  else
    ((FAILED++))
    fail "$MAIN_FILE not found"
  fi

  ((TOTAL++))
  if grep -q "^name: $NAME" "$MAIN_FILE" 2>/dev/null; then
    ((PASSED++))
    success "Name matches: $NAME"
  else
    ((FAILED++))
    fail "Name mismatch"
  fi

  ((TOTAL++))
  if grep -q "^description:" "$MAIN_FILE" 2>/dev/null; then
    ((PASSED++))
    success "Description present"
  else
    ((FAILED++))
    fail "Description missing"
  fi

  ((TOTAL++))
  if grep -q "^allowed-tools:" "$MAIN_FILE" 2>/dev/null; then
    ((PASSED++))
    success "Allowed tools defined"
  else
    ((FAILED++))
    fail "Allowed tools missing"
  fi
fi

if [ "$TYPE" = "prompt" ]; then
  ((TOTAL++))
  if [ -f "$SOURCE" ] && [ -s "$SOURCE" ]; then
    ((PASSED++))
    success "Prompt file exists and is not empty"
  else
    ((FAILED++))
    fail "Prompt file missing or empty"
  fi

  ((TOTAL++))
  if [ -f "$SOURCE" ] && grep -q "^#" "$SOURCE"; then
    ((PASSED++))
    success "Prompt has proper heading"
  else
    ((FAILED++))
    fail "Prompt missing heading"
  fi
fi

echo ""
echo "========================================"
echo "Test Results: $PASSED/$TOTAL passed"
echo "========================================"

if [ $FAILED -gt 0 ]; then
  error "Some tests failed"
  exit 1
else
  success "All tests passed!"
  exit 0
fi
