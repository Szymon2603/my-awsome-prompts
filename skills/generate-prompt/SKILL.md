---
name: generate-prompt
description: Generates AI prompts from brief descriptions. Use when user wants to create a new prompt for code review, documentation, testing, or other tasks. Invokes the prompt generation pipeline with configurable options.
argument-hint: "[brief description]"
disable-model-invocation: false
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash
effort: medium
---

# Generate Prompt Skill

## Purpose
Transform a brief description into a well-structured prompt for AI assistants.

## Workflow

1. **Parse the brief**
   - Extract the goal, domain, and any constraints
   - Identify required prompt type (system, user, few-shot)
   - Determine preferred style (technical, casual, formal, minimal)

2. **Generate the prompt**
   - Use the GeneratorPrompt class from generators/
   - Apply domain-specific guidelines
   - Include examples if provided

3. **Present options**
   - Show the generated prompt
   - Offer refinement iterations if needed

4. **Save output**
   - Write to `.opencode/generated/prompts/{name}.md`
   - Confirm save location to user

## Input Format
The brief can be:
- A simple description: "code review prompt for security"
- A structured brief with constraints and examples
- Reference to an existing skill or domain

## Output Format
Generated prompt saved to `.opencode/generated/prompts/`

## Examples

### Simple Brief
Input: `/generate-prompt code review for API endpoints`

### Structured Brief
```
/generate-prompt
Goal: API documentation generator
Domain: documentation
Style: technical
Constraints: Must include error codes
```

## Tips
- Ask clarifying questions if the brief is ambiguous
- Suggest domain and style if not specified
- Offer to refine based on user feedback
