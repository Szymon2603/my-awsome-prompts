---
name: {{name}}
description: {{description}}
{{#if type}}
type: {{type}}
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
{{#if color}}
color: {{color}}
{{/if}}
{{#if auto-trigger}}
auto-trigger:
  enabled: {{auto-trigger.enabled}}
  {{#if auto-trigger.patterns}}
  patterns:
{{#each auto-trigger.patterns}}
    - {{this}}
{{/each}}
  {{/if}}
  require-consent: {{auto-trigger.require-consent}}
{{/if}}
---

# {{name}}

{{#if persona}}
## Persona
{{persona}}
{{/if}}

{{#if responsibilities}}
## Responsibilities
{{#each responsibilities}}
{{inc @index}}. {{this}}
{{/each}}
{{/if}}

{{#if guidelines}}
## Guidelines
{{#each guidelines}}
- {{this}}
{{/each}}
{{/if}}

{{#if constraints}}
## Constraints
{{#each constraints}}
- {{this}}
{{/each}}
{{/if}}

{{#if capabilities}}
## Capabilities
{{#each capabilities}}
- {{this}}
{{/each}}
{{/if}}

{{#if workflow}}
## Workflow
{{#each workflow}}
{{inc @index}}. {{this}}
{{/each}}
{{/if}}

{{#if tools}}
## Tool Usage
{{#each tools}}
### {{name}}
{{description}}
{{/each}}
{{/if}}

{{#if examples}}
## Examples
{{#each examples}}
### Example {{inc @index}}: {{title}}
{{description}}

**Expected behavior:** {{behavior}}
{{/each}}
{{/if}}
