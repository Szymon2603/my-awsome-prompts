---
name: generate-skill
description: Generates OpenCode/Claude Code compatible skills from prompts or brief descriptions. Use when user wants to create a reusable skill for common tasks. Generates SKILL.md with YAML frontmatter and instructions.
argument-hint: "[prompt or brief description]"
disable-model-invocation: false
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash
effort: medium
---

# Generate Skill Skill

## Purpose
Create a reusable skill from a prompt or brief description.

## Workflow

1. **Analyze input**
   - Parse the prompt/brief for required tools
   - Extract workflow steps and checklists
   - Identify constraints and guidelines

2. **Generate skill structure**
   - Use GeneratorSkill class from generators/
   - Auto-detect allowed-tools from prompt content
   - Create instruction scaffolding

3. **Generate resource files**
   - reference.md: Technical details and patterns
   - examples.md: Usage examples

4. **Validate and save**
   - Validate against skill.schema.json
   - Save to `.opencode/generated/skills/{name}/`

5. **Present to user**
   - Show generated SKILL.md
   - Offer installation instructions

## Input Format
```
/generate-skill {name}
{prompt or brief description}

Options:
  --tools Read,Write,Bash
  --effort low|medium|high
  --auto-trigger
```

## Output Format
```
.opencode/generated/skills/{name}/
├── SKILL.md
├── reference.md
└── examples.md
```

## Installation
To install generated skill:
```bash
cp -r .opencode/generated/skills/{name} ~/.opencode/skills/
```

## Tips
- Suggest appropriate tool set based on prompt analysis
- Offer auto-trigger configuration if workflow is repeatable
- Include examples to demonstrate skill usage
