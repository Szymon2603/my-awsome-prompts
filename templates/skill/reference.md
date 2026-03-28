# {{skill-name}} - Reference

## Overview
{{description}}

## Technical Details

{{#if parameters}}
### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
{{#each parameters}}
| {{name}} | {{type}} | {{required}} | {{description}} |
{{/each}}
{{/if}}

{{#if tools}}
### Available Tools
{{#each tools}}
- **{{name}}**: {{description}}
{{/each}}
{{/if}}

{{#if patterns}}
### Common Patterns
{{#each patterns}}
#### {{title}}
{{description}}

\`\`\`
{{code}}
\`\`\`
{{/each}}
{{/if}}

{{#if limits}}
## Limitations
{{#each limits}}
- {{this}}
{{/each}}
{{/if}}

{{#if related}}
## Related
{{#each related}}
- [{{name}}]({{link}}) - {{description}}
{{/each}}
{{/if}}
