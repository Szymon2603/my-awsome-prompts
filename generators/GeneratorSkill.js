const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { validateSkill } = require('../validate');

const SKILL_TEMPLATE = fs.readFileSync(path.join(__dirname, '../templates/skill/SKILL.md'), 'utf8');
const REFERENCE_TEMPLATE = fs.readFileSync(path.join(__dirname, '../templates/skill/reference.md'), 'utf8');
const EXAMPLES_TEMPLATE = fs.readFileSync(path.join(__dirname, '../templates/skill/examples.md'), 'utf8');

const compileSkill = Handlebars.compile(SKILL_TEMPLATE, { strict: false });
const compileReference = Handlebars.compile(REFERENCE_TEMPLATE, { strict: false });
const compileExamples = Handlebars.compile(EXAMPLES_TEMPLATE, { strict: false });

Handlebars.registerHelper('inc', (value) => value + 1);

const TOOL_PATTERNS = {
  Read: [/\bread\b/i, /\breadFile\b/i, /\bread file\b/i, /\bfile contents\b/i],
  Write: [/\bwrite\b/i, /\bcreate file\b/i, /\bwriteFile\b/i],
  Edit: [/\bedit\b/i, /\bmodify\b/i, /\bupdate file\b/i, /\bpatch\b/i],
  Bash: [/\bbash\b/i, /\bshell\b/i, /\bcommand\b/i, /\bnpm\b/i, /\byarn\b/i, /\bgit\b/i, /\bterminal\b/i],
  Grep: [/\bgrep\b/i, /\bsearch\b/i, /\bfind in\b/i, /\bfind.*file\b/i],
  Glob: [/\bglob\b/i, /\bfind\b.*\bfiles\b/i, /\bfile.*pattern\b/i],
  WebFetch: [/\bfetch\b.*\burl\b/i, /\bweb\b/i, /\bhttp\b/i, /\bapi\b.*\bcall\b/i],
  WebSearch: [/\bsearch\b.*\bweb\b/i, /\bgoogle\b/i, /\binternet\b/i]
};

const TOOL_KEYWORDS = {
  Read: ['read', 'file', 'content', 'source', 'code'],
  Write: ['write', 'create', 'generate', 'save', 'output'],
  Edit: ['edit', 'modify', 'change', 'update', 'replace', 'fix'],
  Bash: ['bash', 'shell', 'command', 'run', 'execute', 'npm', 'yarn', 'git', 'make'],
  Grep: ['grep', 'search', 'find', 'pattern', 'match'],
  Glob: ['glob', 'find files', 'list files', 'file pattern'],
  WebFetch: ['fetch', 'url', 'http', 'api', 'request'],
  WebSearch: ['search', 'google', 'internet', 'web search']
};

class GeneratorSkill {
  constructor(options = {}) {
    this.defaultTools = options.defaultTools || ['Read', 'Write'];
    this.defaultEffort = options.defaultEffort || 'medium';
  }

  detectTools(text) {
    const detected = new Set();
    const lowerText = text.toLowerCase();

    for (const [tool, keywords] of Object.entries(TOOL_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          detected.add(tool);
          break;
        }
      }
    }

    for (const [tool, patterns] of Object.entries(TOOL_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          detected.add(tool);
          break;
        }
      }
    }

    return detected.size > 0 ? Array.from(detected) : this.defaultTools;
  }

  extractWorkflow(text) {
    const workflow = [];
    const lines = text.split('\n');
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^## (Workflow|Process|Steps)/i)) {
        inList = true;
      } else if (trimmed.startsWith('## ') && inList) {
        break;
      } else if (inList && (trimmed.startsWith('- ') || trimmed.startsWith('* '))) {
        workflow.push(trimmed.substring(2).trim());
      } else if (inList && trimmed.match(/^\d+\.\s/)) {
        workflow.push(trimmed.replace(/^\d+\.\s/, '').trim());
      }
    }

    return workflow;
  }

  extractChecklists(text) {
    const checklists = [];
    const lines = text.split('\n');
    let currentChecklist = null;
    let currentItems = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const h3Match = trimmed.match(/^###\s+(.+)/);
      const listMatch = trimmed.match(/^[-*]\s+(.+)/);

      if (h3Match) {
        if (currentChecklist && currentItems.length > 0) {
          checklists.push({ name: currentChecklist, items: [...currentItems] });
        }
        currentChecklist = h3Match[1];
        currentItems = [];
      } else if (listMatch && currentChecklist) {
        currentItems.push(listMatch[1]);
      } else if (trimmed.startsWith('## ') && currentChecklist) {
        checklists.push({ name: currentChecklist, items: [...currentItems] });
        currentChecklist = null;
        currentItems = [];
      }
    }

    if (currentChecklist && currentItems.length > 0) {
      checklists.push({ name: currentChecklist, items: [...currentItems] });
    }

    return checklists;
  }

  extractInstructions(text) {
    const sections = text.split('##').filter(s => {
      const header = s.trim().split('\n')[0].toLowerCase();
      return !['guidelines', 'constraints', 'capabilities', 'examples', 'workflow', 'process', 'steps', 'tips'].includes(header);
    });

    return sections.map(s => s.trim()).filter(Boolean).join('\n\n');
  }

  generate(input, options = {}) {
    let name, description, purpose, instructions, constraints;

    if (typeof input === 'string') {
      description = input;
      name = options.name || this.generateName(input);
      purpose = options.purpose || this.generatePurpose(input);
      instructions = options.instructions || input;
      constraints = options.constraints || [];
    } else {
      name = input.name || options.name;
      description = input.description || input.goal || input.purpose;
      purpose = input.purpose || options.purpose || input.goal;
      instructions = input.instructions || input.goal || options.instructions;
      constraints = input.constraints || [];
    }

    if (!name || !description) {
      throw new Error('Name and description are required');
    }

    const skillData = {
      name: this.sanitizeName(name),
      description: description.substring(0, 1024),
      'argument-hint': options.argumentHint,
      'disable-model-invocation': options.disableModelInvocation || false,
      'user-invocable': options.userInvocable !== false,
      'allowed-tools': options.allowedTools || this.detectTools(instructions || description),
      model: options.model,
      effort: options.effort || this.defaultEffort,
      context: options.context || 'inline',
      paths: options.paths,
      dependencies: options.dependencies,
      purpose,
      workflow: options.workflow || this.extractWorkflow(instructions || ''),
      instructions: instructions,
      checklists: options.checklists || this.extractChecklists(instructions || ''),
      examples: options.examples || [],
      tips: options.tips || []
    };

    const validation = validateSkill({
      name: skillData.name,
      description: skillData.description,
      'allowed-tools': skillData['allowed-tools'],
      model: skillData.model,
      effort: skillData.effort,
      context: skillData.context
    });

    if (!validation.valid) {
      throw new Error(`Invalid skill: ${JSON.stringify(validation.errors)}`);
    }

    return {
      skill: compileSkill(skillData),
      metadata: {
        name: skillData.name,
        tools: skillData['allowed-tools'],
        effort: skillData.effort
      }
    };
  }

  generateResourceFiles(skillName, options = {}) {
    const skillData = {
      'skill-name': skillName,
      description: options.description || '',
      parameters: options.parameters || [],
      tools: options.tools || [],
      patterns: options.patterns || [],
      limits: options.limits || [],
      related: options.related || [],
      'example1-title': options.example1Title || 'Basic usage',
      'example1-brief': options.example1Brief || '',
      'example1-name': skillName,
      'example1-description': options.description || '',
      'example2-title': options.example2Title || 'Advanced usage',
      'example2-brief': options.example2Brief || ''
    };

    return {
      'reference.md': compileReference(skillData),
      'examples.md': compileExamples(skillData)
    };
  }

  generateName(description) {
    const words = description.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 4);
    return words.join('-');
  }

  generatePurpose(description) {
    const purpose = description.split('.')[0];
    return purpose.length < 200 ? purpose : purpose.substring(0, 197) + '...';
  }

  sanitizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 64);
  }

  validateSkillDefinition(definition) {
    return validateSkill(definition);
  }

  generatePlan(input, options = {}) {
    const name = options.name || this.generateName(input.description || input);
    const description = input.description || input.goal || input;
    const tools = options.allowedTools || this.detectTools(description);
    const effort = options.effort || this.defaultEffort;
    const constraints = options.constraints || [];
    const context = options.context || 'inline';

    return {
      type: 'skill',
      name: this.sanitizeName(name),
      description: description.substring(0, 1024),
      allowedTools: tools,
      effort,
      constraints,
      context,
      workflow: this.extractWorkflow(input.instructions || description),
      checklists: this.extractChecklists(input.instructions || description),
      instructions: input.instructions || description
    };
  }

  validateFull(skillPath) {
    const results = {
      schema: { valid: false, errors: [] },
      structure: { valid: false, errors: [], warnings: [] },
      tools: { valid: true, warnings: [] }
    };

    const skillFile = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      results.structure.errors.push('SKILL.md not found');
      return results;
    }

    const skillContent = fs.readFileSync(skillFile, 'utf8');
    const frontmatterMatch = skillContent.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      results.structure.errors.push('Frontmatter not found');
      return results;
    }

    const frontmatter = this.parseFrontmatter(frontmatterMatch[1]);
    const schemaValidation = validateSkill({
      name: frontmatter.name,
      description: frontmatter.description,
      'allowed-tools': frontmatter['allowed-tools'],
      model: frontmatter.model,
      effort: frontmatter.effort,
      context: frontmatter.context
    });

    results.schema = schemaValidation;

    const requiredFiles = ['SKILL.md'];
    const optionalFiles = ['reference.md', 'examples.md'];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(skillPath, file))) {
        results.structure.errors.push(`Required file missing: ${file}`);
      }
    }

    for (const file of optionalFiles) {
      if (!fs.existsSync(path.join(skillPath, file))) {
        results.structure.warnings.push(`Optional file missing: ${file}`);
      }
    }

    const validTools = ['Read', 'Grep', 'Glob', 'Bash', 'Edit', 'Write', 'WebFetch', 'WebSearch'];
    const tools = frontmatter['allowed-tools'] || frontmatter['allowed_tools'] || [];
    if (Array.isArray(tools)) {
      for (const tool of tools) {
        if (!validTools.includes(tool)) {
          if (!results.tools.warnings) results.tools.warnings = [];
          results.tools.warnings.push(`Unknown tool: ${tool}`);
        }
      }
    }

    results.structure.valid = results.structure.errors.length === 0;
    if (!results.tools.warnings) results.tools.warnings = [];
    results.tools.valid = results.tools.warnings.length === 0;

    return results;
  }

  parseFrontmatter(frontmatterText) {
    const result = {};
    const lines = frontmatterText.split('\n');
    let currentKey = null;
    let currentArray = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('- ') && currentKey) {
        currentArray.push(trimmed.substring(2).trim());
      } else if (trimmed.match(/^(\S+):/)) {
        if (currentKey && currentArray.length > 0) {
          result[currentKey] = [...currentArray];
          currentArray = [];
        }
        const match = trimmed.match(/^(\S+):\s*(.*)$/);
        currentKey = match[1];
        const value = match[2].trim();
        
        if (value && !value.startsWith('[')) {
          result[currentKey] = value;
          currentKey = null;
        }
      }
    }

    if (currentKey && currentArray.length > 0) {
      result[currentKey] = currentArray;
    }

    return result;
  }

  async test(skillPath) {
    const results = {
      passed: false,
      tests: [],
      summary: { total: 0, passed: 0, failed: 0 }
    };

    const validationResults = this.validateFull(skillPath);
    
    results.tests.push({
      name: 'JSON Schema Validation',
      passed: validationResults.schema.valid,
      message: validationResults.schema.valid ? 'Schema valid' : JSON.stringify(validationResults.schema.errors)
    });

    results.tests.push({
      name: 'File Structure',
      passed: validationResults.structure.valid,
      message: validationResults.structure.valid ? 'All required files present' : validationResults.structure.errors.join(', ')
    });

    results.tests.push({
      name: 'Tool Configuration',
      passed: validationResults.tools.valid,
      message: validationResults.tools.valid ? 'All tools valid' : (validationResults.tools.warnings || []).join(', ')
    });

    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.passed).length;
    results.summary.failed = results.tests.filter(t => !t.passed).length;
    results.passed = results.summary.failed === 0;

    return results;
  }

  save(generated, outputPath) {
    const skillDir = path.join(outputPath, 'skills', generated.metadata.name);
    
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), generated.skill);

    if (generated.reference) {
      fs.writeFileSync(path.join(skillDir, 'reference.md'), generated.reference);
    }
    if (generated.examples) {
      fs.writeFileSync(path.join(skillDir, 'examples.md'), generated.examples);
    }

    return skillDir;
  }
}

module.exports = GeneratorSkill;
