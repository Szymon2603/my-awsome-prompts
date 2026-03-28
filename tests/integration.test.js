const {
  GeneratorPrompt,
  GeneratorSkill,
  GeneratorAgent,
  Pipeline
} = require('../index');

console.log('=== Integration Tests ===\n');

console.log('--- Test 1: Brief → Prompt → Skill → Agent pipeline ---');
const pipeline = new Pipeline();
const brief = {
  name: 'API Documentation Generator',
  goal: 'Generate comprehensive API documentation for REST endpoints',
  domain: 'documentation',
  style: 'technical'
};

pipeline.briefToPrompt(brief).then(async (result) => {
  console.log('✅ Prompt generated:', result.version);
  
  console.log('\n--- Test 2: Prompt → Skill ---');
  const skillGen = new GeneratorSkill();
  const skillResult = skillGen.generate({
    name: 'api-doc-generator',
    description: 'Generates API documentation from code'
  }, {
    allowedTools: ['Read', 'Write', 'Grep'],
    effort: 'medium'
  });
  console.log('✅ Skill generated:', skillResult.metadata.name);
  
  console.log('\n--- Test 3: Skill → Agent ---');
  const agentGen = new GeneratorAgent();
  const agentResult = agentGen.generate({
    name: 'api-doc-agent',
    description: 'An agent that generates API documentation'
  }, {
    type: 'general',
    allowedTools: ['Read', 'Write', 'Grep'],
    color: 'blue'
  });
  console.log('✅ Agent generated:', agentResult.metadata.name);
  console.log('Agent type:', agentResult.metadata.type);
  
  console.log('\n--- Test 4: Full brief with constraints ---');
  const fullBrief = {
    name: 'Security Code Review',
    goal: 'Review code for security vulnerabilities',
    constraints: ['Check OWASP Top 10', 'Verify input validation'],
    context: 'Web application using Express.js',
    examples: [{ input: 'login endpoint', output: 'vulnerability report' }],
    domain: 'code_review',
    style: 'technical',
    complexity: 'complex'
  };
  
  const promptResult = await pipeline.briefToPrompt(fullBrief);
  console.log('✅ Full prompt generated:', promptResult.version);
  
  const skillFromFull = skillGen.generate(fullBrief);
  console.log('✅ Skill from full brief:', skillFromFull.metadata.name);
  
  const agentFromFull = agentGen.generate(fullBrief);
  console.log('✅ Agent from full brief:', agentFromFull.metadata.name);
  
  console.log('\n✅ All integration tests completed');
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
