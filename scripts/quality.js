#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const QualityMetrics = require('../generators/QualityMetrics');

const metrics = new QualityMetrics();

function printResults(result) {
  const grade = metrics.getGrade(result.overall);
  
  const color = grade.color === 'green' ? '\x1b[32m' :
                grade.color === 'yellow' ? '\x1b[33m' :
                grade.color === 'orange' ? '\x1b[35m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  console.log(`\n${color}[${grade.grade}] Overall Score: ${result.overall}/100 (${grade.label})${reset}\n`);
  
  console.log('Detailed Scores:');
  console.log(`  Clarity:     ${result.clarity.value}/100`);
  console.log(`  Completeness: ${result.completeness.value}/100`);
  console.log(`  Consistency:  ${result.consistency.value}/100`);
  
  if (result.clarity.issues.length || result.completeness.issues.length || result.consistency.issues.length) {
    console.log('\nSuggestions:');
    const suggestions = metrics.suggestImprovements('');
    suggestions.forEach(s => {
      console.log(`  ${s.category}:`);
      s.items.forEach(item => console.log(`    - ${item}`));
    });
  }
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node quality.js <prompt-file.md>');
  console.log('       cat prompt.md | node quality.js --stdin');
  process.exit(1);
}

let prompt = '';

if (args[0] === '--stdin') {
  prompt = fs.readFileSync(0, 'utf8');
} else {
  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  prompt = fs.readFileSync(filePath, 'utf8');
}

const result = metrics.evaluate(prompt);
printResults(result);
