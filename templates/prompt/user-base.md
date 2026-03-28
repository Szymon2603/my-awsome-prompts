# User Prompt Template

{{task}}

{{#if context}}
## Context
{{context}}
{{/if}}

{{#if format}}
## Expected Format
{{format}}
{{/if}}

{{#if examples}}
## Examples
{{#each examples}}
**Example {{inc @index}}:**
Input: {{input}}
Expected Output: {{output}}
{{/each}}
{{/if}}

{{#if constraints}}
## Constraints
{{#each constraints}}
- {{this}}
{{/each}}
{{/if}}

{{#if output_destination}}
## Output
Save to: {{output_destination}}
{{/if}}
