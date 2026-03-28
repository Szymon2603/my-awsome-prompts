const GeneratorAgent = require('../generators/GeneratorAgent');

const generator = new GeneratorAgent();

console.log('=== GeneratorAgent Tests ===\n');

console.log('--- Test 1: Generate from string ---');
const result1 = generator.generate('An agent that explores codebases to find security vulnerabilities');
console.log('Type:', result1.metadata.type);
console.log('Tools:', result1.metadata.tools);
console.log('Agent preview:');
console.log(result1.agent.substring(0, 600) + '...\n');

console.log('--- Test 2: Auto-type detection ---');
const types = [
  { desc: 'Analyze and plan the architecture', expected: 'planner' },
  { desc: 'Read and review the code', expected: 'explorer' },
  { desc: 'Implement the new feature', expected: 'general' }
];

for (const t of types) {
  const detected = generator.selectType(t.desc);
  const status = detected === t.expected ? '✅' : '❌';
  console.log(`${status} "${t.desc.substring(0, 30)}..." → ${detected} (expected: ${t.expected})`);
}

console.log('\n--- Test 3: Generate with options ---');
const result2 = generator.generate({
  name: 'security-scanner',
  description: 'Scans for security vulnerabilities'
}, {
  type: 'explorer',
  allowedTools: ['Read', 'Grep', 'Glob'],
  color: 'red',
  autoTrigger: {
    enabled: true,
    patterns: ['scan security', 'check vulnerabilities'],
    requireConsent: true
  }
});
console.log('Type:', result2.metadata.type);
console.log('Color:', result2.metadata.color);
console.log('Auto-trigger:', JSON.stringify(result2.metadata, null, 2));

console.log('\n--- Test 4: Available types ---');
const availableTypes = generator.getAvailableTypes();
availableTypes.forEach(t => {
  console.log(`- ${t.id}: ${t.name}`);
});

console.log('\n--- Test 5: Generate explorer agent ---');
const explorer = generator.generate('Codebase exploration agent', {
  name: 'code-explorer',
  type: 'explorer',
  color: 'green'
});
console.log(explorer.agent.substring(0, 500) + '...\n');

console.log('--- Test 6: Generate planner agent ---');
const planner = generator.generate('Architecture planning agent', {
  name: 'architecture-planner',
  type: 'planner',
  color: 'purple'
});
console.log(planner.agent.substring(0, 500) + '...\n');

console.log('✅ All GeneratorAgent tests completed');
