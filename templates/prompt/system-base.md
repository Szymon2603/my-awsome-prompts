# System Prompt Template

You are {{persona}}.

## Your Role
{{role_description}}

## Guidelines
{{#each guidelines}}
- {{this}}
{{/each}}

## Constraints
{{#each constraints}}
- {{this}}
{{/each}}

## Capabilities
{{#each capabilities}}
- {{this}}
{{/each}}

{{#if examples}}
## Examples
{{#each examples}}
### Example {{inc @index}}
**Input:** {{input}}
**Output:** {{output}}
{{/each}}
{{/if}}

{{#if tone}}
## Tone
{{tone}}
{{/if}}
