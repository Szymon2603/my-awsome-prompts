# Detailed Tasks - Prompt & Skill Generator

## Phase 1: Fundamenty

### M1.1: Schematy JSON dla skill/agent

- [ ] **T1.1.1** Stwórz `schemas/skill.schema.json`
  - Pola wymagane: name, description
  - Pola opcjonalne: allowed-tools, auto, model, effort
  - String substitutions patterns

- [ ] **T1.1.2** Stwórz `schemas/agent.schema.json`
  - Pola: name, description, type, model, allowed-tools, color
  - Agent types enum: explorer, planner, general

- [ ] **T1.1.3** Stwórz `schemas/brief.schema.json`
  - Pola: name, goal, constraints, context, examples

- [ ] **T1.1.4** Skonfiguruj ajv/jsonschema validation
  - Utility function: validateSkill(), validateAgent()

- [ ] **T1.1.5** Napisz testy walidacji schematów
  - Happy path cases
  - Edge cases
  - Error messages

### M1.2: Generator Promptów v1

- [ ] **T1.2.1** Zdefiniuj typy promptów
  - system_prompt, user_prompt, few_shot
  - Domena: code_review, documentation, testing

- [ ] **T1.2.2** Stwórz base templates
  - `templates/prompt/system-base.md`
  - `templates/prompt/user-base.md`

- [ ] **T1.2.3** Zaimplementuj GeneratorPrompt class
  - Method: generate(brief, options)
  - Method: refine(version, feedback)

- [ ] **T1.2.4** Dodaj parameter validation

### M1.3: Pipeline Brief→Prompt

- [ ] **T1.3.1** Stwórz Pipeline class
  - Method: brief_to_prompt(brief)
  - Method: validate_input(brief)

- [ ] **T1.3.2** Dodaj error handling
  - Invalid brief format
  - LLM failure fallback

---

## Phase 2: Core Generatory

### M2.1: Generator Skilli v1

- [ ] **T2.1.1** Stwórz GeneratorSkill class
  - Input: prompt lub brief
  - Output: SKILL.md content

- [ ] **T2.1.2** Zaimplementuj tool detection
  - Parse prompt for tool usage
  - Map to allowed-tools list

- [ ] **T2.1.3** Generuj instruction scaffolding
  - Step-by-step structure
  - Checklists

- [ ] **T2.1.4** Dodaj resource file generation
  - reference.md template
  - examples.md template

### M2.2: Generator Agentów v1

- [ ] **T2.2.1** Stwórz GeneratorAgent class
  - Input: skill lub prompt
  - Output: AGENT.md content

- [ ] **T2.2.2** Zaimplementuj type selection
  - Analyze task complexity
  - Assign agent type

- [ ] **T2.2.3** Generuj system prompt
  - Persona definition
  - Capability description
  - Guidelines

### M2.3: Walidacja schema + testy

- [ ] **T2.3.1** Stwórz comprehensive test suite
  - Unit tests per generator
  - Integration tests

- [ ] **T2.3.2** Dodaj JSON Schema validation
  - Pre-generation validation
  - Post-generation validation

- [ ] **T2.3.3** Zaimplementuj test runner
  - `npm test` / `pnpm test`

---

## Phase 3: Integracja OpenCode

### M3.1: Skill `/generate-prompt`

- [ ] **T3.1.1** Stwórz `skills/generate-prompt/SKILL.md`
  - Name: generate-prompt
  - Description: Generates AI prompts from brief
  - Allowed-tools: Read, Write, Bash

- [ ] **T3.1.2** Zaimplementuj skill instructions
  - Step-by-step workflow
  - User interaction flow

### M3.2: Skill `/generate-skill`

- [ ] **T3.2.1** Stwórz `skills/generate-skill/SKILL.md`
  - Input validation
  - Generation flow

- [ ] **T3.2.2** Zaimplementuj skill instructions

### M3.3: Skill `/generate-agent`

- [ ] **T3.3.1** Stwórz `skills/generate-agent/SKILL.md`

### M3.4: Agent auto-trigger

- [ ] **T3.4.1** Stwórz `agents/brief-detector/AGENT.md`
  - Pattern: brief detection
  - Auto-propose generation

---

## Phase 4: Zaawansowany Instalator

### M4.1: Script instalacyjny

- [ ] **T4.1.1** Stwórz `scripts/install.sh`
  - Args: skill/agent name
  - Copy to ~/.opencode/
  - Dependency check

- [ ] **T4.1.2** Dodaj install --dry-run
  - Preview changes
  - Conflict detection

### M4.2: Walidacja przy instalacji

- [ ] **T4.2.1** Zintegruj validate.sh
  - Run on install
  - Report issues

- [ ] **T4.2.2** Dodaj fix suggestions
  - Auto-fix common issues

### M4.3: Hot-reload mechanism

- [ ] **T4.3.1** Stwórz `scripts/watch.sh`
  - Monitor .opencode/skills/
  - Auto-reload on change

- [ ] **T4.3.2** Zaimplementuj notification
  - Desktop notification
  - Log to file

---

## Phase 5: Optymalizacja & Docs

### M5.1: Iteracje feedback loop

- [ ] **T5.1.1** Zaimplementuj revision system
  - Version history
  - Diff view

- [ ] **T5.1.2** Dodaj user feedback capture
  - Rating system
  - Comment collection

### M5.2: Dokumentacja użytkownika

- [ ] **T5.2.1** Stwórz README.md
  - Installation
  - Usage
  - Examples

- [ ] **T5.2.2** Stwórz CONTRIBUTING.md

### M5.3: Przykłady użycia

- [ ] **T5.3.1** Stwórz `examples/` directory
  - Example briefs
  - Generated outputs
  - Before/after comparisons
