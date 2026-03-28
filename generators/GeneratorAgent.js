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
}

module.exports = GeneratorAgent;
module.exports.AGENT_TYPES = AGENT_TYPES;
