const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { validateAgent } = require('../validate');

const AGENT_TEMPLATE = fs.readFileSync(path.join(__dirname, '../templates/agent/AGENT.md'), 'utf8');

const compileAgent = Handlebars.compile(AGENT_TEMPLATE, { strict: false });

Handlebars.registerHelper('inc', (value) => value + 1);

const AGENT_TYPES = {
  explorer: {
    name: 'Explorer',
    persona: 'a thorough code explorer specializing in reading and analyzing codebases without making changes',
    defaultTools: ['Read', 'Grep', 'Glob'],
    guidelines: [
      'Provide file paths and line numbers for all findings',
      'Read full context before drawing conclusions',
      'Summarize findings in a structured format',
      'Be thorough but efficient - avoid redundant exploration'
    ]
  },
  planner: {
    name: 'Planner',
    persona: 'an architect specializing in planning, design, and strategic decision-making',
    defaultTools: ['Read', 'Grep', 'Glob', 'TodoWrite'],
    guidelines: [
      'Consider multiple approaches before recommending one',
      'Break complex tasks into manageable steps',
      'Identify dependencies and potential risks',
      'Provide clear rationale for recommendations'
    ]
  },
  general: {
    name: 'General Purpose',
    persona: 'a versatile AI assistant capable of handling various tasks including reading, writing, and modifying code',
    defaultTools: ['Read', 'Grep', 'Glob', 'Bash', 'Edit', 'Write'],
    guidelines: [
      'Be helpful and comprehensive',
      'Ask clarifying questions when needed',
      'Provide clear explanations',
      'Balance thoroughness with efficiency'
    ]
  },
  custom: {
    name: 'Custom',
    persona: 'a specialized AI assistant',
    defaultTools: ['Read', 'Write'],
    guidelines: [
      'Follow the specific guidelines provided'
    ]
  }
};

const COMPLEXITY_PATTERNS = {
  planning: {
    patterns: ['plan', 'design', 'architect', 'strategy', 'propose', 'recommend', 'approach'],
    type: 'planner'
  },
  read_heavy: {
    patterns: ['explore', 'find', 'search', 'understand', 'review'],
    type: 'explorer'
  },
  implementation: {
    patterns: ['implement', 'build', 'create', 'write', 'modify', 'fix', 'add', 'change'],
    type: 'general'
  }
};

class GeneratorAgent {
  constructor(options = {}) {
    this.defaultType = options.defaultType || 'general';
    this.defaultColor = options.defaultColor || 'blue';
  }

  selectType(input) {
    if (typeof input === 'object' && input.type) {
      const validType = AGENT_TYPES[input.type];
      if (validType) return input.type;
    }

    const text = typeof input === 'string' ? input : (input.description || input.goal || '');
    const lowerText = text.toLowerCase();

    for (const [, config] of Object.entries(COMPLEXITY_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (lowerText.includes(pattern)) {
          return config.type;
        }
      }
    }

    return this.defaultType;
  }

  generate(input, options = {}) {
    let name, description;

    if (typeof input === 'string') {
      description = input;
      name = options.name || this.generateName(input);
    } else {
      name = input.name || options.name;
      description = input.description || input.goal || input.purpose || options.description;
    }

    if (!name || !description) {
      throw new Error('Name and description are required');
    }

    const type = options.type || this.selectType(input);
    const typeConfig = AGENT_TYPES[type] || AGENT_TYPES.general;

    const agentData = {
      name: this.sanitizeName(name),
      description: description.substring(0, 1024),
      type,
      'allowed-tools': options.allowedTools || typeConfig.defaultTools,
      model: options.model,
      color: options.color || this.defaultColor,
      'auto-trigger': options.autoTrigger ? {
        enabled: options.autoTrigger.enabled !== false,
        patterns: options.autoTrigger.patterns || [],
        'require-consent': options.autoTrigger.requireConsent !== false
      } : undefined,
      persona: options.persona || typeConfig.persona,
      responsibilities: options.responsibilities || this.generateResponsibilities(input, type),
      guidelines: options.guidelines || typeConfig.guidelines,
      constraints: options.constraints || [],
      capabilities: options.capabilities || [],
      workflow: options.workflow || [],
      tools: options.toolDescriptions || [],
      examples: options.examples || []
    };

    const validation = validateAgent({
      name: agentData.name,
      description: agentData.description,
      type: agentData.type,
      'allowed-tools': agentData['allowed-tools'],
      model: agentData.model,
      color: agentData.color,
      'auto-trigger': agentData['auto-trigger']
    });

    if (!validation.valid) {
      throw new Error(`Invalid agent: ${JSON.stringify(validation.errors)}`);
    }

    return {
      agent: compileAgent(agentData),
      metadata: {
        name: agentData.name,
        type: agentData.type,
        tools: agentData['allowed-tools'],
        color: agentData.color
      }
    };
  }

  generateResponsibilities(input, type) {
    const description = typeof input === 'string' ? input : (input.description || input.goal || '');
    const responsibilities = [];

    if (type === 'explorer') {
      responsibilities.push(
        'Explore and analyze the codebase thoroughly',
        'Identify patterns, dependencies, and potential issues',
        'Provide detailed findings with file paths'
      );
    } else if (type === 'planner') {
      responsibilities.push(
        'Analyze requirements and constraints',
        'Design solution architecture',
        'Create actionable implementation plans',
        'Identify risks and mitigation strategies'
      );
    } else {
      responsibilities.push(
        'Understand the task requirements',
        'Implement solutions effectively',
        'Test and validate the implementation'
      );
    }

    return responsibilities;
  }

  generateName(description) {
    const words = description.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 4);
    return words.join('-');
  }

  sanitizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 64);
  }

  getAvailableTypes() {
    return Object.entries(AGENT_TYPES).map(([key, value]) => ({
      id: key,
      name: value.name,
      persona: value.persona
    }));
  }

  generatePlan(input, options = {}) {
    const name = options.name || this.generateName(input.description || input);
    const description = input.description || input.goal || input;
    const type = options.type || this.selectType(input);
    const typeConfig = AGENT_TYPES[type] || AGENT_TYPES.general;
    const tools = options.allowedTools || typeConfig.defaultTools;
    const color = options.color || this.defaultColor;
    const constraints = options.constraints || [];
    const capabilities = options.capabilities || [];

    return {
      type: 'agent',
      name: this.sanitizeName(name),
      description: description.substring(0, 1024),
      type,
      allowedTools: tools,
      color,
      constraints,
      capabilities,
      persona: options.persona || typeConfig.persona,
      responsibilities: options.responsibilities || this.generateResponsibilities(input, type),
      guidelines: options.guidelines || typeConfig.guidelines,
      autoTrigger: options.autoTrigger || null
    };
  }

  validateFull(agentPath) {
    const results = {
      schema: { valid: false, errors: [] },
      structure: { valid: false, errors: [] },
      tools: { valid: false, warnings: [] }
    };

    const agentFile = path.join(agentPath, 'AGENT.md');
    if (!fs.existsSync(agentFile)) {
      results.structure.errors.push('AGENT.md not found');
      return results;
    }

    const agentContent = fs.readFileSync(agentFile, 'utf8');
    const frontmatterMatch = agentContent.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      results.structure.errors.push('Frontmatter not found');
      return results;
    }

    const frontmatter = this.parseFrontmatter(frontmatterMatch[1]);
    
    const schemaValidation = validateAgent({
      name: frontmatter.name,
      description: frontmatter.description,
      type: frontmatter.type,
      'allowed-tools': frontmatter['allowed-tools'],
      model: frontmatter.model,
      color: frontmatter.color,
      'auto-trigger': frontmatter['auto-trigger'] ? JSON.parse(frontmatter['auto-trigger']) : undefined
    });

    results.schema = schemaValidation;
    results.structure.valid = results.structure.errors.length === 0;

    const validTools = ['Read', 'Grep', 'Glob', 'Bash', 'Edit', 'Write', 'WebFetch', 'WebSearch', 'TodoWrite', 'Task'];
    for (const tool of frontmatter['allowed-tools'] || []) {
      if (!validTools.includes(tool)) {
        results.tools.warnings.push(`Unknown tool: ${tool}`);
      }
    }

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
      } else if (trimmed.match(/^(\w+):/)) {
        if (currentKey) {
          result[currentKey] = currentArray.length > 0 ? currentArray : result[currentKey];
        }
        const match = trimmed.match(/^(\w+):\s*(.*)$/);
        currentKey = match[1];
        const value = match[2].trim();
        
        if (value && !value.startsWith('[')) {
          result[currentKey] = value;
          currentKey = null;
        } else {
          currentArray = [];
        }
      }
    }

    if (currentKey) {
      result[currentKey] = currentArray.length > 0 ? currentArray : result[currentKey];
    }

    return result;
  }

  async test(agentPath) {
    const results = {
      passed: false,
      tests: [],
      summary: { total: 0, passed: 0, failed: 0 }
    };

    const validationResults = this.validateFull(agentPath);
    
    results.tests.push({
      name: 'JSON Schema Validation',
      passed: validationResults.schema.valid,
      message: validationResults.schema.valid ? 'Schema valid' : JSON.stringify(validationResults.schema.errors)
    });

    results.tests.push({
      name: 'File Structure',
      passed: validationResults.structure.valid,
      message: validationResults.structure.valid ? 'AGENT.md present' : validationResults.structure.errors.join(', ')
    });

    results.tests.push({
      name: 'Tool Configuration',
      passed: validationResults.tools.valid,
      message: validationResults.tools.valid ? 'All tools valid' : validationResults.tools.warnings.join(', ')
    });

    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.passed).length;
    results.summary.failed = results.tests.filter(t => !t.passed).length;
    results.passed = results.summary.failed === 0;

    return results;
  }

  save(generated, outputPath) {
    const agentDir = path.join(outputPath, 'agents', generated.metadata.name);
    
    fs.mkdirSync(agentDir, { recursive: true });
    fs.writeFileSync(path.join(agentDir, 'AGENT.md'), generated.agent);

    return agentDir;
  }
}

module.exports = GeneratorAgent;
module.exports.AGENT_TYPES = AGENT_TYPES;
