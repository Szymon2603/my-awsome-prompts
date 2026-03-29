# Artifact Architect - Szczegółowe Wymagania

## Agent Definition

```yaml
name: artifact-architect
description: Master agent for creating skills, agents, and prompts. Handles requirement gathering, building, testing, and installation.
type: general
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - TodoWrite
auto-trigger:
  enabled: true
  patterns:
    - "build a"
    - "create a skill"
    - "create an agent"
    - "create a prompt"
    - "generate a skill"
    - "generate an agent"
    - "generate a prompt"
    - "I want to create"
    - "I want to build"
  require-consent: true
```

## Workflow - Krok po Kroku

### Krok 1: Detect Intent

Gdy użytkownik wyrazi chęć stworzenia czegoś:
1. Określ typ artefaktu (skill/agent/prompt)
2. Wyciągnij kluczowe wymagania z wypowiedzi
3. Zaproponuj dalsze kroki

### Krok 2: Requirement Gathering

Dla SKILL:
- Jak ma się skill nazywać? (name)
- Co skill ma robić? (description)
- Jakie narzędzia ma używać? (allowed-tools: Read, Write, Bash, Grep, Glob, Edit)
- Jaki poziom trudności? (effort: low/medium/high)
- Jakie są ograniczenia?

Dla AGENT:
- Jak agent ma się nazywać? (name)
- Co agent ma robić? (description)
- Jaki typ agenta? (explorer/planner/general)
- Jakie narzędzia? (allowed-tools)
- Czy ma mieć auto-trigger? Jakie wzorce?

Dla PROMPT:
- Jak prompt ma się nazywać? (name)
- Jaki jest cel promptu? (goal)
- Jaka domena? (domain: code_review, documentation, testing, etc.)
- Jaki styl? (style: technical, casual, formal)
- Jakie są ograniczenia?

### Krok 3: Present Plan

Pokaż użytkownikowi plan:
```
Proposed {type}: {name}

Description: {description}
Type: {type}
Tools: {tools}
Constraints: {constraints}

Should I proceed with generation? (yes/no/modify)
```

### Krok 4: Generate

Po akceptacji:
1. Wywołaj odpowiedni generator
2. Zapisz do .opencode/generated/
3. Wykonaj walidację

### Krok 5: Test & Validate

```bash
# Walidacja JSON Schema
node validate.js {type} .opencode/generated/{type}/{name}/

# Testy jednostkowe
npm test -- {type}
```

### Krok 6: Present & Install

Pokaż:
- Wygenerowany artefakt
- Wyniki testów
- Opcje instalacji

Zapytaj o lokalizację:
```
Where to install?
1) Global (~/.opencode/{type}s/)
2) Local (./.opencode/{type}s/)
3) Custom path
```

## Error Handling

- Jeśli walidacja nie przechodzi: pokaż błędy, zaproponuj naprawę
- Jeśli użytkownik anuluje: wróć do stanu początkowego
- Jeśli generator zawodzi: pokaż błąd, zaproponuj retry

## Dependencies

- `generators/GeneratorSkill.js` - metody: generate(), detectTools(), validateSkillDefinition()
- `generators/GeneratorAgent.js` - metody: generate(), selectType(), getAvailableTypes()
- `generators/GeneratorPrompt.js` - metody: generate(), validateInput()
- `validate.js` - funkcje walidacji
- `schemas/skill.schema.json`
- `schemas/agent.schema.json`
- `scripts/test-*.sh` - skrypty testowe

## Acceptance Criteria

1. [ ] Agent reaguje na trigger patterns
2. [ ] Zbiera wymagania przez pytania
3. [ ] Generuje plan i czeka na akceptację
4. [ ] Tworzy artefakt w .opencode/generated/
5. [ ] Waliduje przez JSON Schema
6. [ ] Uruchamia testy jednostkowe
7. [ ] Prezentuje wyniki i oferuje instalację
8. [ ] Instalacja działa interaktywnie (pyta o lokalizację)
