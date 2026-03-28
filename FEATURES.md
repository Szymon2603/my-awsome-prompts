# Feature List - Prompt & Skill Generator

## F1: Format danych i schematy

### F1.1: Skill Schema
- Format SKILL.md z YAML frontmatter
- Pola: name, description, allowed-tools, auto-trigger
- String substitutions: $ARGUMENTS, $N
- Walidacja JSON Schema

### F1.2: Agent Schema  
- Format AGENT.md z YAML frontmatter
- Pola: name, description, type, model, allowed-tools, color
- Wsparcie dla agent types: explorer, planner, general

### F1.3: Brief Schema
- Standardowy format opisu zadania
- Pola: name, goal, constraints, context, examples

---

## F2: Generator Promptów

### F2.1: Core Engine
- LLM-based prompt generation
- Szablony dla różnych typów promptów
- Parametry: ton, długość, struktura

### F2.2: Iterative Refinement
- Feedback loop z użytkownikiem
- Versioning promptów
- Diff między wersjami

### F2.3: Prompt Templates
- System prompt template
- User prompt template
- Few-shot examples generator

---

## F3: Generator Skilli

### F3.1: Skill Builder
- Generowanie SKILL.md z promptu
- Auto-detekcja allowed-tools
- Instruction scaffolding

### F3.2: Resource Generator
- Tworzenie katalogów skill
- Template reference.md
- Template examples.md

### F3.3: Validation
- Schema validation
- Tool availability check
- Description quality scoring

---

## F4: Generator Agentów

### F4.1: Agent Builder
- Generowanie AGENT.md z skillu
- Auto-wybór agent type
- System prompt optimization

### F4.2: Capability Mapping
- Mapowanie skill → agent capabilities
- Tool permission inheritance
- Context boundary definition

### F4.3: Testing Interface
- Dry-run capability
- Mock execution
- Result validation

---

## F5: Integracja OpenCode

### F5.1: Skill: /generate-prompt
- Manual invocation
- Argument: brief description
- Output: generated prompt file

### F5.2: Skill: /generate-skill
- Manual invocation
- Input: prompt lub brief
- Output: .opencode/skills/NAME/

### F5.3: Skill: /generate-agent
- Manual invocation
- Input: skill lub prompt
- Output: .opencode/agents/NAME/

### F5.4: Agent: Auto-Trigger
- Detect brief patterns
- Propose generation
- Consent-based execution

---

## F6: Zaawansowany Instalator

### F6.1: install.sh
- Copy to ~/.opencode/skills/
- Dependency resolution
- Config merge

### F6.2: validate.sh
- Schema validation
- Tool availability
- Syntax check

### F6.3: Hot-Reload
- Watch mode
- Auto-reload on change
- Notification system

---

## F7: Feedback & Optymalizacja

### F7.1: Iteration Loop
- User feedback capture
- Prompt adjustment
- Regeneration with context

### F7.2: Quality Metrics
- Clarity score
- Completeness check
- Consistency validation

### F7.3: Learning (opcjonalne)
- Track successful patterns
- Suggest improvements
- Learn from corrections
