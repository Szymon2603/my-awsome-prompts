---
name: {{name}}
description: {{description}}
{{#if argument-hint}}
argument-hint: {{argument-hint}}
{{/if}}
{{#if disable-model-invocation}}
disable-model-invocation: {{disable-model-invocation}}
{{/if}}
{{#if user-invocable}}
user-invocable: {{user-invocable}}
{{/if}}
{{#if allowed-tools}}
allowed-tools:
{{#each allowed-tools}}
  - {{this}}
{{/each}}
{{/if}}
{{#if model}}
model: {{model}}
{{/if}}
{{#if effort}}
effort: {{effort}}
{{/if}}
{{#if context}}
context: {{context}}
{{/if}}
{{#if paths}}
paths: "{{paths}}"
{{/if}}
{{#if dependencies}}
dependencies:
{{#each dependencies}}
  - {{this}}
{{/each}}
{{/if}}
---

# {{name}}

{{#if purpose}}
## Purpose
{{purpose}}
{{/if}}

{{#if workflow}}
## Workflow
{{#each workflow}}
{{inc @index}}. {{this}}
{{/each}}
{{/if}}

{{#if instructions}}
## Instructions
{{instructions}}
{{/if}}

{{#if checklists}}
## Checklists
{{#each checklists}}
### {{name}}
{{#each items}}
- [ ] {{this}}
{{/each}}
{{/each}}
{{/if}}

{{#if examples}}
## Examples
{{#each examples}}
### Example {{inc @index}}: {{title}}
**Input:** {{input}}
**Output:** {{output}}
{{/each}}
{{/if}}

{{#if tips}}
## Tips
{{#each tips}}
- {{this}}
{{/each}}
{{/if}}
