const { validateSkill, validateAgent, validateBrief } = require('../validate');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function run() {
  let passed = 0;
  let failed = 0;
  
  for (const t of tests) {
    try {
      t.fn();
      console.log(`✅ ${t.name}`);
      passed++;
    } catch (e) {
      console.log(`❌ ${t.name}`);
      console.log(`   Error: ${e.message}`);
      failed++;
    }
  }
  
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

test('valid skill passes validation', () => {
  const skill = {
    name: 'code-review',
    description: 'Performs code review'
  };
  const result = validateSkill(skill);
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
});

test('skill name must be lowercase with hyphens', () => {
  const skill = {
    name: 'CodeReview',
    description: 'Test'
  };
  const result = validateSkill(skill);
  if (result.valid) throw new Error('Should have failed');
});

test('valid agent passes validation', () => {
  const agent = {
    name: 'security-auditor',
    description: 'Security vulnerability scanner'
  };
  const result = validateAgent(agent);
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
});

test('valid brief passes validation', () => {
  const brief = {
    name: 'API Documentation',
    goal: 'Generate API documentation for REST endpoints'
  };
  const result = validateBrief(brief);
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
});

test('brief with full properties passes', () => {
  const brief = {
    name: 'Code Review',
    goal: 'Generate code review skill',
    constraints: ['Must follow security best practices'],
    context: 'Web application security',
    examples: [{ input: 'xss vulnerability', output: 'Security check' }],
    target: 'skill',
    style: 'technical',
    complexity: 'moderate',
    domain: 'security'
  };
  const result = validateBrief(brief);
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
});

test('skill with all optional fields passes', () => {
  const skill = {
    name: 'api-doc-generator',
    description: 'Generates API documentation',
    'argument-hint': '[endpoint-file]',
    'disable-model-invocation': true,
    'user-invocable': true,
    'allowed-tools': ['Read', 'Grep', 'Write'],
    model: 'opus',
    effort: 'high',
    context: 'fork',
    agent: 'general',
    paths: 'src/**/*.ts'
  };
  const result = validateSkill(skill);
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
});

test('skill name max length 64', () => {
  const skill = {
    name: 'a'.repeat(65),
    description: 'Test'
  };
  const result = validateSkill(skill);
  if (result.valid) throw new Error('Should have failed');
});

test('agent with auto-trigger passes', () => {
  const agent = {
    name: 'brief-detector',
    description: 'Detects brief patterns',
    type: 'general',
    'auto-trigger': {
      enabled: true,
      patterns: ['I want to build', 'Create a'],
      'require-consent': true
    }
  };
  const result = validateAgent(agent);
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
});

test('brief requires name', () => {
  const brief = {
    goal: 'Just a goal'
  };
  const result = validateBrief(brief);
  if (result.valid) throw new Error('Should have failed - brief without name was accepted');
});

run();
