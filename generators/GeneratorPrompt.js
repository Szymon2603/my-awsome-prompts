const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { validateBrief } = require('../validate');

const TYPES = require('../prompt-types/types.json');
const SYSTEM_TEMPLATE = fs.readFileSync(path.join(__dirname, '../templates/prompt/system-base.md'), 'utf8');
const USER_TEMPLATE = fs.readFileSync(path.join(__dirname, '../templates/prompt/user-base.md'), 'utf8');

const compileSystem = Handlebars.compile(SYSTEM_TEMPLATE, { strict: true });
const compileUser = Handlebars.compile(USER_TEMPLATE, { strict: true });

Handlebars.registerHelper('inc', (value) => value + 1);

class GeneratorPrompt {
  constructor(options = {}) {
    this.model = options.model || 'claude';
    this.defaultStyle = options.style || 'technical';
    this.defaultDomain = options.domain || 'general';
  }

  validateInput(brief) {
    const result = validateBrief(brief);
    if (!result.valid) {
      throw new Error(`Invalid brief: ${JSON.stringify(result.errors)}`);
    }
    return result;
  }

  async generate(brief, options = {}) {
    this.validateInput(brief);

    const type = options.type || 'system_prompt';
    const style = brief.style || options.style || this.defaultStyle;
    const domain = brief.domain || options.domain || this.defaultDomain;

    const typeConfig = TYPES.types[type] || TYPES.types.system_prompt;
    const domainConfig = TYPES.domains[domain] || TYPES.domains.general;
    const styleConfig = TYPES.styles[style] || TYPES.styles.technical;

    const promptData = this.buildPromptData(brief, typeConfig, domainConfig, styleConfig, options);

    if (type === 'user_prompt') {
      return compileUser(promptData);
    }

    return compileSystem(promptData);
  }

  buildPromptData(brief, typeConfig, domainConfig, styleConfig, options) {
    const persona = options.persona || this.generatePersona(brief, domainConfig);
    const guidelines = this.generateGuidelines(brief, domainConfig, typeConfig);
    const constraints = brief.constraints || [];

    return {
      persona,
      role_description: brief.goal,
      guidelines,
      constraints,
      capabilities: this.generateCapabilities(brief, domainConfig),
      examples: brief.examples || [],
      tone: styleConfig.tone,
      task: brief.goal,
      context: brief.context,
      format: options.format,
      output_destination: options.output
    };
  }

  generatePersona(brief, domain) {
    const personas = {
      code_review: 'an expert code reviewer specializing in security, performance, and best practices',
      documentation: 'a technical writer with expertise in clear, comprehensive documentation',
      testing: 'a QA engineer focused on comprehensive test coverage and edge cases',
      refactoring: 'a software architect specializing in clean code and maintainability',
      debugging: 'a senior developer expert in systematic debugging and problem solving',
      general: 'an AI assistant ready to help with various tasks'
    };
    return personas[brief.domain] || personas.general;
  }

  generateGuidelines(brief, domain, type) {
    const baseGuidelines = [
      'Provide clear, actionable responses',
      'Include relevant examples where helpful',
      'Ask clarifying questions when needed'
    ];

    const domainGuidelines = {
      code_review: [
        'Check for security vulnerabilities first',
        'Look for performance bottlenecks',
        'Verify adherence to coding standards',
        'Suggest concrete improvements with code examples'
      ],
      documentation: [
        'Use clear headings and structure',
        'Include code examples',
        'Explain the "why" not just the "how"',
        'Keep documentation up to date'
      ],
      testing: [
        'Aim for high test coverage',
        'Include edge cases',
        'Write descriptive test names',
        'Follow Arrange-Act-Assert pattern'
      ],
      refactoring: [
        'Preserve existing behavior',
        'Make small, incremental changes',
        'Write tests before refactoring',
        'Focus on readability and maintainability'
      ],
      debugging: [
        'Reproduce the issue first',
        'Narrow down the root cause',
        'Fix the cause, not the symptoms',
        'Add tests to prevent regression'
      ],
      general: baseGuidelines
    };

    return [...(domainGuidelines[brief.domain] || domainGuidelines.general), ...baseGuidelines];
  }

  generateCapabilities(brief, domain) {
    const baseCapabilities = [
      'Read and analyze code',
      'Write and modify code',
      'Explain complex concepts',
      'Suggest improvements'
    ];

    const domainCapabilities = {
      code_review: [
        'Static code analysis',
        'Security vulnerability detection',
        'Performance profiling',
        'Code quality assessment'
      ],
      documentation: [
        'API documentation',
        'README files',
        'Code comments',
        'Usage guides'
      ],
      testing: [
        'Unit tests',
        'Integration tests',
        'E2E tests',
        'Test fixtures'
      ],
      general: baseCapabilities
    };

    return [...(domainCapabilities[brief.domain] || baseCapabilities)];
  }

  async refine(existingPrompt, feedback, options = {}) {
    if (!existingPrompt || !feedback) {
      throw new Error('Existing prompt and feedback are required for refinement');
    }

    const refined = existingPrompt;

    if (feedback.addConstraints) {
      refined.constraints = [...(refined.constraints || []), ...feedback.addConstraints];
    }

    if (feedback.addGuidelines) {
      refined.guidelines = [...(refined.guidelines || []), ...feedback.addGuidelines];
    }

    if (feedback.removeSections) {
      feedback.removeSections.forEach(section => {
        delete refined[section];
      });
    }

    if (feedback.style) {
      const styleConfig = TYPES.styles[feedback.style];
      if (styleConfig) {
        refined.tone = styleConfig.tone;
      }
    }

    return refined;
  }

  getAvailableTypes() {
    return Object.entries(TYPES.types).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description
    }));
  }

  getAvailableDomains() {
    return Object.entries(TYPES.domains).map(([key, value]) => ({
      id: key,
      name: value.name,
      focus: value.focus
    }));
  }

  getAvailableStyles() {
    return Object.entries(TYPES.styles).map(([key, value]) => ({
      id: key,
      name: value.name,
      tone: value.tone
    }));
  }

  generatePlan(brief, options = {}) {
    const name = options.name || this.generateName(brief.goal);
    const type = options.type || brief.type || 'system_prompt';
    const domain = brief.domain || options.domain || this.defaultDomain;
    const style = brief.style || options.style || this.defaultStyle;
    const constraints = brief.constraints || [];

    const typeConfig = TYPES.types[type] || TYPES.types.system_prompt;
    const domainConfig = TYPES.domains[domain] || TYPES.domains.general;

    return {
      type: 'prompt',
      name,
      goal: brief.goal,
      domain,
      style,
      type,
      constraints,
      persona: this.generatePersona({ domain }, domainConfig),
      guidelines: this.generateGuidelines({ domain }, domainConfig, typeConfig),
      capabilities: this.generateCapabilities({ domain }, domainConfig),
      examples: brief.examples || []
    };
  }

  generateName(goal) {
    const words = goal.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 4);
    return words.join('-');
  }

  validateFull(promptPath) {
    const results = {
      structure: { valid: false, errors: [] },
      content: { valid: false, warnings: [] }
    };

    if (!fs.existsSync(promptPath)) {
      results.structure.errors.push('Prompt file not found');
      return results;
    }

    const promptContent = fs.readFileSync(promptPath, 'utf8');
    
    if (promptContent.length < 50) {
      results.content.warnings.push('Prompt content is very short');
    }

    if (!promptContent.includes('#') && !promptContent.startsWith('You are')) {
      results.content.warnings.push('Missing proper prompt structure');
    }

    results.structure.valid = results.structure.errors.length === 0;
    results.content.valid = results.content.warnings.length === 0;

    return results;
  }

  async test(promptPath) {
    const results = {
      passed: false,
      tests: [],
      summary: { total: 0, passed: 0, failed: 0 }
    };

    const validationResults = this.validateFull(promptPath);
    
    results.tests.push({
      name: 'File Exists',
      passed: fs.existsSync(promptPath),
      message: fs.existsSync(promptPath) ? 'Prompt file exists' : 'Prompt file not found'
    });

    results.tests.push({
      name: 'Content Structure',
      passed: validationResults.content.valid,
      message: validationResults.content.valid ? 'Content looks good' : validationResults.content.warnings.join(', ')
    });

    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.passed).length;
    results.summary.failed = results.tests.filter(t => !t.passed).length;
    results.passed = results.summary.failed === 0;

    return results;
  }

  save(prompt, outputPath, name) {
    const promptDir = path.join(outputPath, 'prompts');
    const promptFile = path.join(promptDir, `${name}.md`);
    
    fs.mkdirSync(promptDir, { recursive: true });
    fs.writeFileSync(promptFile, prompt);

    return promptFile;
  }
}

module.exports = GeneratorPrompt;
