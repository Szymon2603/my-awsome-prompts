#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseFrontmatter(filePath, field = null) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.startsWith('---')) {
      return field ? '' : {};
    }
    
    const parts = content.split('---');
    if (parts.length < 3) {
      return field ? '' : {};
    }
    
    const yamlStr = parts[1];
    const data = {};
    
    yamlStr.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (value.startsWith('[') && value.endsWith(']')) {
          data[key] = value.slice(1, -1).split(',').map(s => s.trim());
        } else {
          data[key] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
    
    if (field) {
      const result = data[field];
      if (Array.isArray(result)) return result.join(' ');
      return result || '';
    }
    return data;
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: parse_frontmatter.js <file> [field]');
    process.exit(1);
  }
  
  const filePath = path.resolve(args[0]);
  const field = args[1] || null;
  
  const result = parseFrontmatter(filePath, field);
  
  if (field) {
    console.log(result);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

module.exports = { parseFrontmatter };
