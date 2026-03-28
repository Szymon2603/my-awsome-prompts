const GeneratorSkill = require('../generators/GeneratorSkill');

const generator = new GeneratorSkill();

console.log('=== GeneratorSkill Tests ===\n');

console.log('--- Test 1: Generate from string ---');
const result1 = generator.generate('Code review skill for security vulnerabilities', {
  name: 'security-code-review'
});
console.log('Name:', result1.metadata.name);
console.log('Tools:', result1.metadata.tools);
console.log('Skill preview:');
console.log(result1.skill.substring(0, 500) + '...\n');

console.log('--- Test 2: Generate from brief ---');
const brief = {
  name: 'api-documentation',
  description: 'Generates API documentation for REST endpoints',
  goal: 'Create comprehensive API docs with examples',
  constraints: ['Must include error codes', 'Must document rate limits']
};
const result2 = generator.generate(brief);
console.log('Name:', result2.metadata.name);
console.log('Tools:', result2.metadata.tools);
console.log('Skill preview:');
console.log(result2.skill.substring(0, 500) + '...\n');

console.log('--- Test 3: Tool detection ---');
const textWithTools = 'Read the file, search for patterns, and write the output using bash commands';
const tools = generator.detectTools(textWithTools);
console.log('Detected tools:', tools.join(', '));

console.log('\n--- Test 4: Generate with options ---');
const result3 = generator.generate({
  name: 'test-skill',
  description: 'Test skill description'
}, {
  allowedTools: ['Read', 'Grep', 'Bash'],
  effort: 'high',
  context: 'fork',
  disableModelInvocation: true,
  paths: 'src/**/*.ts'
});
console.log('Tools:', result3.metadata.tools);
console.log('Effort:', result3.metadata.effort);

console.log('\n--- Test 5: Resource files ---');
const resources = generator.generateResourceFiles('test-skill', {
  description: 'Test skill for resources',
  tools: [{ name: 'Read', description: 'Read files' }],
  parameters: [{ name: 'file', type: 'string', required: true, description: 'File to process' }]
});
console.log('Reference.md preview:');
console.log(resources['reference.md'].substring(0, 300) + '...\n');

console.log('--- Test 6: Name sanitization ---');
const sanitized = generator.generateName('My Awesome Skill! @#$%');
console.log('Sanitized name:', sanitized);

console.log('\n✅ All GeneratorSkill tests completed');
