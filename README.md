# Prompt & Skill Generator

Generator for prompts, skills, and agents for OpenCode/Claude Code.

## Quick Start

```bash
# Install skills to OpenCode
./scripts/install.sh all --validate --backup

# Validate existing skills
./scripts/validate.sh all .opencode/

# Watch for changes and reload
./scripts/watch.sh --daemon --notify

# Check prompt quality
node scripts/quality.js my-prompt.md
```

## Pipeline

```
Brief → Prompt → Skill → Agent
```

1. **Brief** - Describe what you want in natural language
2. **Prompt** - LLM-generated system prompt
3. **Skill** - Package prompt as reusable OpenCode skill
4. **Agent** - Create auto-trigger agent from skill

## Generated Skills

### `/generate-prompt`
Generate a system prompt from a brief description.

```markdown
/genernerate-prompt Create a code reviewer that checks for security issues
```

### `/generate-skill`
Package a prompt as an OpenCode skill.

```markdown
/generate-skill Based on my code reviewer prompt, create a skill
```

### `/generate-agent`
Create an auto-trigger agent from a skill.

```markdown
/generate-agent Create an agent that auto-detects code review opportunities
```

## Scripts

| Script | Purpose |
|--------|---------|
| `install.sh` | Install skills/agents to ~/.opencode |
| `validate.sh` | Validate SKILL.md / AGENT.md |
| `watch.sh` | Hot-reload on file changes |
| `quality.js` | Analyze prompt quality |

### install.sh Options

```bash
--dry-run      Preview without installing
--force        Overwrite existing
--validate     Run validation first
--backup       Create backup
--watch        Enable hot-reload
```

## Direct Usage

```javascript
const Pipeline = require('./generators/Pipeline');

const pipeline = new Pipeline();
const result = await pipeline.briefToPrompt({
  name: 'code-reviewer',
  goal: 'Review code for security issues',
  constraints: ['OWASP guidelines', 'Node.js focused']
});

// Refine based on feedback
const refined = await pipeline.refinePrompt(result.version, {
  clarity: 'Make it more specific to SQL injection'
});
```

## Schema Validation

```bash
# Validate single skill
./scripts/validate.sh skill skills/my-skill

# Validate all
./scripts/validate.sh all .opencode/

# Strict mode
./scripts/validate.sh all .opencode/ --strict
```

## Quality Metrics

Evaluate prompt quality with:

```bash
node scripts/quality.js my-prompt.md
```

Output includes:
- **Clarity** - Sections, bullets, examples, instructions
- **Completeness** - Length, role, goal, constraints, output format
- **Consistency** - Structure, bullet ratio, formatting

## Project Structure

```
.
├── generators/
│   ├── GeneratorPrompt.js   # Prompt generation
│   ├── GeneratorSkill.js     # Skill generation
│   ├── GeneratorAgent.js     # Agent generation
│   ├── Pipeline.js           # Brief → Prompt pipeline
│   └── QualityMetrics.js     # Prompt quality scoring
├── schemas/
│   ├── skill.schema.json
│   ├── agent.schema.json
│   └── brief.schema.json
├── scripts/
│   ├── install.sh
│   ├── validate.sh
│   ├── watch.sh
│   └── quality.js
├── skills/
│   ├── generate-prompt/
│   ├── generate-skill/
│   └── generate-agent/
└── agents/
    └── brief-detector/
```

## Requirements

- Node.js 18+
- OpenCode (for skill/agent installation)
- bash (for scripts)

## License

MIT
