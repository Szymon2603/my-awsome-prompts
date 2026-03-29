# Examples

## Briefs

Sample input briefs in JSON format.

### `code-reviewer.json`
Security-focused code reviewer brief.

### `api-documentation.json`
API documentation generator brief.

### `test-generator.json`
Unit test generator brief.

## Generated

Example outputs from the pipeline.

### `code-reviewer-prompt.md`
Generated security code reviewer prompt.

## Usage

```javascript
const Pipeline = require('../generators/Pipeline');
const fs = require('fs');

const brief = JSON.parse(fs.readFileSync(__dirname + '/briefs/code-reviewer.json'));
const pipeline = new Pipeline();

pipeline.briefToPrompt(brief).then(result => {
  console.log(result.prompt);
});
```
