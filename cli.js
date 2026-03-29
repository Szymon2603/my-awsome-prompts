#!/usr/bin/env node

const GeneratorSkill = require('./generators/GeneratorSkill');
const GeneratorAgent = require('./generators/GeneratorAgent');
const GeneratorPrompt = require('./generators/GeneratorPrompt');
const path = require('path');
const fs = require('fs');

const GENERATED_DIR = path.join(__dirname, '.opencode/generated');

const generators = {
  skill: new GeneratorSkill(),
  agent: new GeneratorAgent(),
  prompt: new GeneratorPrompt()
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function generate(type, name, options = {}) {
  const generator = generators[type];
  if (!generator) {
    throw new Error(`Unknown type: ${type}. Use: skill, agent, or prompt`);
  }

  let input;
  if (type === 'prompt') {
    input = options.input || { goal: options.description || `Generated ${type}: ${name}`, name };
  } else {
    input = options.input || { name, description: options.description || `Generated ${type}: ${name}` };
  }
  
  const genOptions = {
    ...options,
    name
  };

  let result;
  
  if (type === 'prompt') {
    const prompt = await generator.generate(input, genOptions);
    result = { prompt, metadata: { name } };
  } else {
    result = generator.generate(input, genOptions);
  }

  let outputDir;
  
  if (type === 'prompt') {
    outputDir = path.join(GENERATED_DIR, 'prompts');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, `${name}.md`), result.prompt);
  } else {
    outputDir = path.join(GENERATED_DIR, `${type}s`, name);
    fs.mkdirSync(outputDir, { recursive: true });
  
    if (type === 'skill') {
      fs.writeFileSync(path.join(outputDir, 'SKILL.md'), result.skill);
      if (result.reference) {
        fs.writeFileSync(path.join(outputDir, 'reference.md'), result.reference);
      }
      if (result.examples) {
        fs.writeFileSync(path.join(outputDir, 'examples.md'), result.examples);
      }
    } else if (type === 'agent') {
      fs.writeFileSync(path.join(outputDir, 'AGENT.md'), result.agent);
    }
  }

  return { result, outputDir };
}

async function validate(type, name) {
  const generator = generators[type];
  if (!generator) {
    throw new Error(`Unknown type: ${type}`);
  }

  let artifactPath = path.join(GENERATED_DIR, `${type}s`, name);
  
  if (type === 'prompt') {
    artifactPath = path.join(GENERATED_DIR, 'prompts', `${name}.md`);
  }
  
  return generator.test(artifactPath);
}

function list(type) {
  const dir = path.join(GENERATED_DIR, `${type}s`);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'generate' || command === 'gen') {
    const type = args[1];
    const name = args[2];
    const description = args.find(a => a.startsWith('--description='))?.split('=')[1] || `Generated ${type}: ${name}`;
    
    if (!type || !name) {
      console.error('Usage: node cli.js generate <skill|agent|prompt> <name> [--description="..."]');
      process.exit(1);
    }

    console.log(`Generating ${type}: ${name}...`);
    const { outputDir } = await generate(type, name, { description });
    console.log(`✓ Saved to: ${outputDir}`);
    
    console.log('\nValidating...');
    const validation = await validate(type, name);
    console.log(`✓ Tests: ${validation.summary.passed}/${validation.summary.total} passed`);
    
    console.log('\nTo install:');
    console.log(`  ./scripts/install.sh ${type} ${name}`);
    
  } else if (command === 'validate' || command === 'test') {
    const type = args[1];
    const name = args[2];
    
    if (!type || !name) {
      console.error('Usage: node cli.js validate <skill|agent|prompt> <name>');
      process.exit(1);
    }

    console.log(`Testing ${type}: ${name}...`);
    const validation = await validate(type, name);
    
    console.log(`\nResults: ${validation.summary.passed}/${validation.summary.total} passed`);
    for (const test of validation.tests) {
      console.log(`  ${test.passed ? '✓' : '✗'} ${test.name}`);
    }
    
    process.exit(validation.passed ? 0 : 1);
    
  } else if (command === 'list' || command === 'ls') {
    const type = args[1] || 'all';
    
    if (type === 'all') {
      console.log('Skills:', list('skill').join(', ') || '(none)');
      console.log('Agents:', list('agent').join(', ') || '(none)');
      console.log('Prompts:', list('prompt').join(', ') || '(none)');
    } else {
      console.log(`${capitalize(type)}s:`, list(type).join(', ') || '(none)');
    }
    
  } else if (command === 'help' || !command) {
    console.log(`
Artifact Generator CLI

Usage:
  node cli.js generate <type> <name> [options]  Generate an artifact
  node cli.js validate <type> <name>            Test an artifact
  node cli.js list [type]                       List artifacts

Types:
  skill   - Generate a skill
  agent   - Generate an agent
  prompt  - Generate a prompt

Options:
  --description=<text>  Description for the artifact

Examples:
  node cli.js generate skill my-skill
  node cli.js generate agent java-dev-agent --description="Java development agent"
  node cli.js validate skill my-skill
  node cli.js list skills
`);
  } else {
    console.error(`Unknown command: ${command}`);
    console.error('Run: node cli.js help');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
