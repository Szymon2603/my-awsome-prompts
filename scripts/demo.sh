#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GENERATED_DIR="$PROJECT_ROOT/.opencode/generated"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo "========================================"
echo "Artifact Architect Demo"
echo "========================================"
echo ""

info "This demo shows the complete workflow:"
echo "  1. Generate artifact using Node.js"
echo "  2. Validate using test-artifact.sh"
echo "  3. Show installation options"
echo ""

DEMO_TYPE="${1:-agent}"
DEMO_NAME="${2:-demo-java-agent}"

info "Creating demo $DEMO_TYPE: $DEMO_NAME"

DEMO_DIR=""
case $DEMO_TYPE in
  skill)
    DEMO_DIR="$GENERATED_DIR/skills/$DEMO_NAME"
    mkdir -p "$DEMO_DIR"
    cat > "$DEMO_DIR/SKILL.md" << 'EOF'
---
name: demo-java-agent
description: Demo skill for Java development
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
effort: medium
---

# Demo Java Agent Skill

## Purpose
Demo skill showing artifact generation works.

## Workflow
1. Analyze requirements
2. Generate code
3. Validate output
EOF
    ;;
  agent)
    DEMO_DIR="$GENERATED_DIR/agents/$DEMO_NAME"
    mkdir -p "$DEMO_DIR"
    cat > "$DEMO_DIR/AGENT.md" << 'EOF'
---
name: demo-java-agent
description: Demo agent for Java application development
type: general
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Demo Java Agent

## Persona
A Java development expert specializing in Spring Boot applications.

## Responsibilities
- Generate Java application structure
- Create Spring Boot controllers
- Set up Maven/Gradle build files

## Guidelines
- Follow Java best practices
- Use Spring Boot conventions
- Include proper error handling
EOF
    ;;
  prompt)
    DEMO_DIR="$GENERATED_DIR/prompts"
    mkdir -p "$DEMO_DIR"
    cat > "$DEMO_DIR/$DEMO_NAME.md" << 'EOF'
# Demo Java Prompt

You are a Java expert. Generate code following Java conventions.
EOF
    ;;
esac

info "Created demo artifact at: $DEMO_DIR"
echo ""

info "Running validation tests..."
echo ""

"$SCRIPT_DIR/test-artifact.sh" "$DEMO_TYPE" "$DEMO_NAME"

echo ""
info "Demo complete!"
echo ""
echo "To install this artifact, run:"
echo "  ./scripts/install.sh $DEMO_TYPE $DEMO_NAME"
