# Epic: Artifact Architect

## Status: ✅ Zakończony

## Cel

Agent master obsługujący pełny cykl tworzenia skills, agents i prompts w OpenCode/Claude Code.

## Wymagania

### Faza 1: Zbieranie Wymagań

- [x] Agent zadaje pytania o cel artefaktu
- [x] Pyta o narzędzia (tools) jakie mają być dostępne
- [x] Pyta o typ (dla agent: explorer/planner/general)
- [x] Pyta o ograniczenia i constraints
- [x] Pyta o styl (dla prompt: technical/casual/formal)
- [x] Pyta o domenę (code_review, documentation, testing, etc.)

### Faza 2: Plan

- [x] Generuje brief na podstawie odpowiedzi
- [x] Prezentuje plan przed budowaniem
- [x] Czeka na akceptację użytkownika
- [x] Oferuje modyfikację planu

### Faza 3: Budowanie

- [x] Używa GeneratorSkill.js do tworzenia skill
- [x] Używa GeneratorAgent.js do tworzenia agent
- [x] Używa GeneratorPrompt.js do tworzenia prompt
- [x] Zapisuje do `.opencode/generated/{type}/{name}/`

### Faza 4: Testowanie i Walidacja

- [x] Uruchamia walidację JSON Schema
- [x] Uruchamia testy jednostkowe z /tests/
- [x] Prezentuje wyniki testów

### Faza 5: Instalacja

- [x] Prezentuje wygenerowany artefakt
- [x] Oferuje instalację interaktywną:
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

## Status: ✅ Zakończony
