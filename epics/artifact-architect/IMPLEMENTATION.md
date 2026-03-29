# Artifact Architect - Implementation Plan

## Faza 1: Generatory (Rozszerzenie)

### GeneratorSkill.js

```javascript
// Nowe metody do dodania:

// Testowanie wygenerowanego skill
test(skillPath) {
  // Uruchom testy z tests/skill-generator.test.js
  // Zwróć wyniki
}

// Pełna walidacja
validateFull(skillData) {
  // JSON Schema + dodatkowe reguły
}

// Generowanie planu przed budowaniem
generatePlan(brief) {
  // Zwróć strukturę planu do akceptacji
}
```

### GeneratorAgent.js

Analogiczne metody rozszerzające.

### GeneratorPrompt.js

Analogiczne metody rozszerzające.

## Faza 2: Skrypt Testowy

### scripts/test-artifact.sh

```bash
#!/bin/bash

# Testowanie przed instalacją
# Usage: ./scripts/test-artifact.sh {skill|agent} {name}

TYPE=$1
NAME=$2
SOURCE=".opencode/generated/${TYPE}s/$NAME"

# 1. Sprawdź czy istnieje
# 2. Walidacja JSON Schema
# 3. Uruchom testy jednostkowe
# 4. Zwróć wyniki
```

## Faza 3: Install Script (Modernizacja)

### scripts/install.sh

- Interaktywny wybór lokalizacji
- Obsługa global/local/custom
- Walidacja przed instalacją (wymagane)
- Backup przed nadpisaniem

## Faza 4: Agent

### agents/artifact-architect/AGENT.md

Główny agent implementujący workflow.

## Faza 5: Brief Detector Update

### agents/brief-detector/AGENT.md

Zmienić wywołanie z pojedynczych skill na artifact-architect.

---

## Kolejność Implementacji

1. **Rozszerzenie Generatorów** - dodanie metod test/validate/generatePlan
2. **Skrypt test-artifact.sh** - testowanie przed instalacją
3. **Modernizacja install.sh** - interaktywna instalacja
4. **Agent artifact-architect** - główny workflow
5. **Update brief-detector** - przekierowanie do architect
6. **Testy integracyjne** - end-to-end workflow
