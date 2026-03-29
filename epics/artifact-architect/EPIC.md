# Epic: Artifact Architect

## Status: Planowany

## Cel

Agent master obsługujący pełny cykl tworzenia skills, agents i prompts w OpenCode/Claude Code.

## Wymagania

### Faza 1: Zbieranie Wymagań

- [ ] Agent zadaje pytania o cel artefaktu
- [ ] Pyta o narzędzia (tools) jakie mają być dostępne
- [ ] Pyta o typ (dla agent: explorer/planner/general)
- [ ] Pyta o ograniczenia i constraints
- [ ] Pyta o styl (dla prompt: technical/casual/formal)
- [ ] Pyta o domenę (code_review, documentation, testing, etc.)

### Faza 2: Plan

- [ ] Generuje brief na podstawie odpowiedzi
- [ ] Prezentuje plan przed budowaniem
- [ ] Czeka na akceptację użytkownika
- [ ] Oferuje modyfikację planu

### Faza 3: Budowanie

- [ ] Używa GeneratorSkill.js do tworzenia skill
- [ ] Używa GeneratorAgent.js do tworzenia agent
- [ ] Używa GeneratorPrompt.js do tworzenia prompt
- [ ] Zapisuje do `.opencode/generated/{type}/{name}/`

### Faza 4: Testowanie i Walidacja

- [ ] Uruchamia walidację JSON Schema
- [ ] Uruchamia testy jednostkowe z /tests/
- [ ] Prezentuje wyniki testów

### Faza 5: Instalacja

- [ ] Prezentuje wygenerowany artefakt
- [ ] Oferuje instalację interaktywną:
  - Global (~/.opencode/)
  - Lokal (w bieżącym projekcie)
  - Własna ścieżka

## Auto-trigger Patterns

- "build", "create", "generate"
- "I want to create"
- "Create a skill/agent/prompt for"
- "Generate me a"
- "Build me a"

## Output Location

```
.opencode/generated/
├── skills/{name}/
│   └── SKILL.md
├── agents/{name}/
│   └── AGENT.md
└── prompts/{name}.md
```

## Dependencies

- GeneratorSkill.js
- GeneratorAgent.js
- GeneratorPrompt.js
- Schemas (skill.schema.json, agent.schema.json)
- Test scripts

## Status: Planowany
