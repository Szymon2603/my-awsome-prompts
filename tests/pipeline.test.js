const Pipeline = require('../generators/Pipeline');

const pipeline = new Pipeline();

console.log('=== Pipeline Tests ===\n');

console.log('--- Test 1: Brief to Prompt ---');
const brief1 = {
  name: 'API Documentation',
  goal: 'Generate API documentation for REST endpoints',
  domain: 'documentation',
  style: 'technical'
};

pipeline.briefToPrompt(brief1).then(result => {
  console.log('Success:', result.success);
  console.log('Version:', result.version);
  console.log('Duration:', result.metadata.duration, 'ms');
  console.log('\n--- Generated Prompt ---');
  console.log(result.prompt);
  
  console.log('\n--- Test 2: Invalid Brief ---');
  return pipeline.briefToPrompt({ goal: 'test' }).catch(err => {
    console.log('Caught expected error:', err.code);
    console.log('Message:', err.message);
    return pipeline.briefToPrompt(brief1);
  });
}).then(() => {
  console.log('\n--- Test 3: Refine Prompt ---');
  const history = pipeline.getHistory();
  const latestVersion = history[history.length - 1];
  return pipeline.refinePrompt(latestVersion.id, {
    addGuidelines: ['Add specific code examples'],
    style: 'formal'
  });
}).then(result => {
  console.log('Refined:', result.success);
  console.log('New Version:', result.version);
  console.log('Previous:', result.previousVersion);
  console.log('\n--- Refined Prompt ---');
  console.log(result.prompt);
  
  console.log('\n--- Test 4: History ---');
  console.log(pipeline.getHistory());
  
  console.log('\n✅ All Pipeline tests completed');
}).catch(err => {
  console.error('❌ Error:', err.message);
  if (err.cause) console.error('Cause:', err.cause.message);
  process.exit(1);
});
