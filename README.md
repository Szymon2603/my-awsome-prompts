# Prompt & Skill Generator

Create prompts, skills, and agents from simple JSON descriptions.

## TL;DR

1. Write a brief in JSON
2. Run the generator
3. Install to OpenCode

---

## Tutorial: Creating a New Skill

### Step 1: Create a Brief

Create `my-brief.json`:

```json
{
  "name": "sql-inject-detector",
  "goal": "Detect SQL injection vulnerabilities in JavaScript code",
  "domain": "security",
  "style": "technical",
  "constraints": [
    "Check all SQL queries",
    "Report line and column of vulnerability",
    "Suggest secure alternatives"
  ]
}
```

### Step 2: Generate Prompt

```bash
# Use Node.js REPL or create a script
node -e "
const Pipeline = require('./generators/Pipeline');
const pipeline = new Pipeline();

const brief = {
  name: 'sql-inject-detector',
  goal: 'Detect SQL injection vulnerabilities in JavaScript code',
  domain: 'security',
  constraints: ['Check all SQL queries', 'Report line number']
};

pipeline.briefToPrompt(brief).then(r => {
  console.log(r.prompt);
}).catch(e => console.error(e));
"
```

### Step 3: Check Quality

```bash
node scripts/quality.js - << 'EOF'
## Role
You are a security expert...

## Guidelines
- Check all SQL queries
- Report vulnerabilities

## Constraints
- Never suggest workarounds...
EOF
```

### Step 4: Package as Skill

Create skill structure:

```bash
mkdir -p .opencode/generated/skills/sql-inject-detector
```

Create `.opencode/generated/skills/sql-inject-detector/SKILL.md`:

```markdown
---
name: sql-inject-detector
description: Detects SQL injection vulnerabilities in JavaScript code
allowed-tools: Read,Grep
---

## Role
You are a security expert...

## Guidelines
- Check all SQL queries
- Look for string concatenation in queries
- Recommend parameterized queries

## Output
Format: [SEVERITY] Line X - Vulnerability
```

### Step 5: Install

```bash
./scripts/install.sh skill sql-inject-detector --validate
```

---

## Project Structure

```
.
├── generators/
│   ├── Pipeline.js          # Main pipeline Brief → Prompt
│   ├── GeneratorPrompt.js   # Generate prompts from templates
│   ├── GeneratorSkill.js     # Generate skills from prompts
│   ├── GeneratorAgent.js     # Generate agents
│   └── QualityMetrics.js     # Check prompt quality
├── templates/
│   ├── prompt/               # Handlebars templates
│   └── skill/
├── schemas/                  # JSON Schema for validation
└── scripts/
    ├── install.sh            # Install to ~/.opencode
    ├── validate.sh           # Validate skill/agent
    └── quality.js            # Prompt quality analysis
```

---

## Examples

### Generate Prompt from JSON File

```javascript
const Pipeline = require('./generators/Pipeline');
const fs = require('fs');

const brief = JSON.parse(fs.readFileSync('examples/briefs/code-reviewer.json'));
const pipeline = new Pipeline();

pipeline.briefToPrompt(brief).then(result => {
  fs.writeFileSync('output/prompt.md', result.prompt);
});
```

### Feedback Loop (Refinement)

```javascript
// Generate initial version
const v1 = await pipeline.briefToPrompt(brief);

// Provide feedback
const v2 = await pipeline.refinePrompt(v1.version, {
  addGuidelines: ['Always check input validation'],
  style: 'detailed'
});

// Check quality
const QualityMetrics = require('./generators/QualityMetrics');
const metrics = new QualityMetrics();
const score = metrics.evaluate(v2.prompt);
console.log(`Quality: ${score.overall}/100`);
```

---

## CLI Scripts

| Command | Description |
|---------|-------------|
| `./scripts/install.sh skill NAME` | Install skill to OpenCode |
| `./scripts/validate.sh skill PATH` | Validate skill correctness |
| `./scripts/quality.js FILE.md` | Analyze prompt quality |
| `./scripts/watch.sh` | Auto-reload on changes |

### install.sh Options

```bash
--dry-run      # Preview without installing
--force        # Overwrite existing
--validate     # Validate before install
--backup       # Backup first
```

---

## Brief Format (Input)

```json
{
  "name": "brief-name",
  "goal": "What the prompt should do",
  "domain": "security|documentation|testing|coding",
  "style": "technical|casual|formal",
  "constraints": ["constraint 1", "constraint 2"],
  "examples": [
    { "input": "example", "output": "result" }
  ]
}
```

---

## Skill Format (Output)

```markdown
---
name: skill-name
description: Short description
allowed-tools: Read,Write,Bash
---

## Role
AI role description.

## Guidelines
- Guideline 1
- Guideline 2

## Constraints
- Constraint 1
- Constraint 2

## Output Format
How the output should look.
```

---

## Requirements

- Node.js 18+
- bash
- OpenCode (optional, for skill installation)

## License

MIT
