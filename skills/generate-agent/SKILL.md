---
name: generate-agent
description: Generates autonomous agents from skills or detailed descriptions. Use when user wants to create an agent that can operate independently. Generates AGENT.md with persona, capabilities, and auto-trigger configuration.
argument-hint: "[skill name or description]"
disable-model-invocation: false
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash
effort: high
---

# Generate Agent Skill

## Purpose
Create an autonomous agent from a skill or detailed description.

## Workflow

1. **Analyze requirements**
   - If skill provided: extract capabilities and constraints
   - If description: identify agent type (explorer, planner, general)
   - Determine tool requirements

2. **Select agent type**
   - **explorer**: Read-heavy, analysis tasks
   - **planner**: Design, architecture, strategic tasks
   - **general**: Mixed read/write/implementation tasks

3. **Generate agent**
   - Use GeneratorAgent class from generators/
   - Create persona, responsibilities, guidelines
   - Configure auto-trigger patterns if applicable

4. **Validate and save**
   - Validate against agent.schema.json
   - Save to `.opencode/generated/agents/{name}/`

5. **Present to user**
   - Show generated AGENT.md
   - Explain agent capabilities
   - Provide installation instructions

## Input Format
```
/generate-agent {name}
{description or skill-reference}

Options:
  --type explorer|planner|general
  --tools Read,Write,Bash
  --auto-trigger "pattern1","pattern2"
  --require-consent true|false
```

## Agent Types

| Type | Persona | Best For |
|------|---------|----------|
| explorer | Code analysis, pattern finding | Read-only exploration |
| planner | Architecture, design | Planning and strategy |
| general | Versatile assistant | Mixed tasks |

## Output Format
```
.opencode/generated/agents/{name}/
└── AGENT.md
```

## Installation
To install generated agent:
```bash
cp -r .opencode/generated/agents/{name} ~/.opencode/agents/
```

## Tips
- Recommend agent type based on description
- Suggest auto-trigger patterns for repeatable tasks
- Set require-consent=true for destructive operations
