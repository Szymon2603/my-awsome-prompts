# Prompt & Skill Generator - Roadmap

## Fazy projektu

### Phase 1: Fundamenty
**Cel:** Zbudować szkielet generatora i formaty danych

| Milestone | Opis | Status |
|-----------|------|--------|
| M1.1 | Schematy JSON dla skill/agent | ⬜ |
| M1.2 | Generator Promptów v1 | ⬜ |
| M1.3 | Pipeline Brief→Prompt | ⬜ |

**Deliverables:** `.opencode/schemas/` z walidacją

---

### Phase 2: Core Generatory
**Cel:** Pełne generatory z walidacją

| Milestone | Opis | Status |
|-----------|------|--------|
| M2.1 | Generator Skilli v1 | ⬜ |
| M2.2 | Generator Agentów v1 | ⬜ |
| M2.3 | Walidacja schema + testy | ⬜ |

**Deliverables:** Generatory + test suite

---

### Phase 3: Integracja OpenCode
**Cel:** Skill i Agent jako callable units

| Milestone | Opis | Status |
|-----------|------|--------|
| M3.1 | Skill `/generate-prompt` | ⬜ |
| M3.2 | Skill `/generate-skill` | ⬜ |
| M3.3 | Agent auto-trigger | ⬜ |

**Deliverables:** `.opencode/skills/generate-*.md`

---

### Phase 4: Zaawansowany Instalator
**Cel:** Instalacja, walidacja, hot-reload

| Milestone | Opis | Status |
|-----------|------|--------|
| M4.1 | Script instalacyjny | ⬜ |
| M4.2 | Walidacja przy instalacji | ⬜ |
| M4.3 | Hot-reload mechanism | ⬜ |

**Deliverables:** `scripts/install.sh`, `scripts/validate.sh`

---

### Phase 5: Optymalizacja & Docs
**Cel:** Dostrojenie i dokumentacja

| Milestone | Opis | Status |
|-----------|------|--------|
| M5.1 | Iteracje feedback loop | ⬜ |
| M5.2 | Dokumentacja użytkownika | ⬜ |
| M5.3 | Przykłady użycia | ⬜ |

---

## Timeline (sugestia)

```
Week 1-2: Phase 1 (Fundamenty)
Week 3-4: Phase 2 (Core Generatory)  
Week 5:   Phase 3 (Integracja OpenCode)
Week 6:   Phase 4 (Zaawansowany Instalator)
Week 7:   Phase 5 (Optymalizacja & Docs)
```

---

## Zależności między fazami

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5
   │            │            │            │
   └── Schemas  └── Generatory └── Integracja └── Instalator
```

---

## Wymagania techniczne

- **Kompatybilność:** Agent Skills (agentskills.io) + OpenCode
- **Storage:** `.opencode/skills/`, `.opencode/agents/`
- **Instalator:** Zaawansowany (walidacja + hot-reload)
- **Typ wywołania:** Skill (manual) + Agent (auto-trigger)
- **Testowanie:** JSON schema + live test with feedback
