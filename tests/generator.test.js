const GeneratorPrompt = require('../generators/GeneratorPrompt');

const generator = new GeneratorPrompt();

console.log('=== GeneratorPrompt Tests ===\n');

console.log('Available Types:', generator.getAvailableTypes().map(t => t.id).join(', '));
console.log('Available Domains:', generator.getAvailableDomains().map(d => d.id).join(', '));
console.log('Available Styles:', generator.getAvailableStyles().map(s => s.id).join(', '));

console.log('\n--- Test 1: Basic System Prompt ---');
const brief1 = {
  name: 'API Documentation Generator',
  goal: 'Generate comprehensive API documentation for REST endpoints',
  domain: 'documentation',
  style: 'technical'
};

generator.generate(brief1).then(prompt => {
  console.log(prompt);
  
  console.log('\n--- Test 2: User Prompt ---');
  return generator.generate(brief1, { type: 'user_prompt' });
}).then(prompt => {
  console.log(prompt);
  
  console.log('\n--- Test 3: Full Brief ---');
  const brief2 = {
    name: 'Security Code Review',
    goal: 'Review authentication code for vulnerabilities',
    constraints: ['Check for SQL injection', 'Verify password hashing'],
    context: 'Node.js Express application',
    examples: [{ input: 'login endpoint', output: 'security assessment' }],
    domain: 'code_review',
    style: 'technical',
    complexity: 'complex'
  };
  return generator.generate(brief2);
}).then(prompt => {
  console.log(prompt);
  
  console.log('\n✅ All tests completed');
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
