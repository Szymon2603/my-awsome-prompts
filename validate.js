const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

const skillSchema = require('./schemas/skill.schema.json');
const agentSchema = require('./schemas/agent.schema.json');
const briefSchema = require('./schemas/brief.schema.json');

const validateSkill = ajv.compile(skillSchema);
const validateAgent = ajv.compile(agentSchema);
const validateBrief = ajv.compile(briefSchema);

function validate(validator, data, name) {
  const valid = validator(data);
  if (!valid) {
    const errors = validator.errors.map(e => ({
      path: e.instancePath || '/',
      message: e.message,
      keyword: e.keyword
    }));
    return { valid: false, errors };
  }
  return { valid: true, errors: [] };
}

module.exports = {
  validateSkill: (data) => validate(validateSkill, data, 'skill'),
  validateAgent: (data) => validate(validateAgent, data, 'agent'),
  validateBrief: (data) => validate(validateBrief, data, 'brief'),
  schemas: {
    skill: skillSchema,
    agent: agentSchema,
    brief: briefSchema
  }
};
