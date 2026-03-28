const GeneratorPrompt = require('./GeneratorPrompt');
const { validateBrief } = require('../validate');

class Pipeline {
  constructor(options = {}) {
    this.generator = new GeneratorPrompt(options);
    this.history = [];
  }

  validateInput(brief) {
    const result = validateBrief(brief);
    if (!result.valid) {
      throw new PipelineError('INVALID_BRIEF', `Invalid brief: ${JSON.stringify(result.errors)}`);
    }
    return result;
  }

  async briefToPrompt(brief, options = {}) {
    this.validateInput(brief);

    const startTime = Date.now();
    const context = {
      brief,
      options,
      startedAt: new Date().toISOString()
    };

    try {
      const prompt = await this.generator.generate(brief, options);
      const version = this.createVersion(brief, prompt, options, null);
      this.history.push(version);

      return {
        success: true,
        prompt,
        version: version.id,
        metadata: {
          duration: Date.now() - startTime,
          type: options.type || 'system_prompt',
          domain: brief.domain || 'general'
        }
      };
    } catch (error) {
      const version = this.createVersion(brief, null, options, error);
      this.history.push(version);

      if (error instanceof PipelineError) {
        throw error;
      }

      throw new PipelineError('GENERATION_FAILED', `Failed to generate prompt: ${error.message}`, error);
    }
  }

  async refinePrompt(versionId, feedback) {
    const version = this.history.find(v => v.id === versionId);
    if (!version) {
      throw new PipelineError('VERSION_NOT_FOUND', `Version ${versionId} not found`);
    }

    try {
      const refinedData = await this.generator.refine(version.promptData, feedback);
      
      const refinedBrief = {
        ...version.brief,
        goal: refinedData.role_description || version.brief.goal
      };

      if (refinedData.tone) {
        refinedBrief.style = feedback.style;
      }

      const prompt = await this.generator.generate(refinedBrief, { ...version.options, refinement: true });
      
      const newVersion = this.createVersion(refinedBrief, prompt, version.options, null, feedback);
      this.history.push(newVersion);

      return {
        success: true,
        prompt,
        version: newVersion.id,
        previousVersion: versionId,
        metadata: {
          refined: true,
          feedbackProvided: Object.keys(feedback)
        }
      };
    } catch (error) {
      throw new PipelineError('REFINEMENT_FAILED', `Failed to refine prompt: ${error.message}`, error);
    }
  }

  createVersion(brief, prompt, options, error, feedback = null) {
    return {
      id: `v${this.history.length + 1}-${Date.now()}`,
      brief: { ...brief },
      prompt: prompt || null,
      promptData: prompt ? this.parsePromptToData(prompt) : null,
      options: { ...options },
      error: error ? error.message : null,
      feedback,
      createdAt: new Date().toISOString()
    };
  }

  parsePromptToData(promptText) {
    const data = {
      guidelines: [],
      constraints: [],
      capabilities: []
    };

    const lines = promptText.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('## Guidelines')) {
        currentSection = 'guidelines';
      } else if (trimmed.startsWith('## Constraints')) {
        currentSection = 'constraints';
      } else if (trimmed.startsWith('## Capabilities')) {
        currentSection = 'capabilities';
      } else if (trimmed.startsWith('##')) {
        currentSection = null;
      } else if (trimmed.startsWith('- ') && currentSection) {
        data[currentSection].push(trimmed.substring(2));
      }
    }

    return data;
  }

  getHistory() {
    return this.history.map(v => ({
      id: v.id,
      briefName: v.brief.name,
      version: v.id,
      createdAt: v.createdAt,
      success: v.error === null,
      error: v.error
    }));
  }

  getVersion(versionId) {
    return this.history.find(v => v.id === versionId);
  }

  clearHistory() {
    this.history = [];
  }
}

class PipelineError extends Error {
  constructor(code, message, cause = null) {
    super(message);
    this.code = code;
    this.cause = cause;
    this.name = 'PipelineError';
  }
}

module.exports = Pipeline;
module.exports.PipelineError = PipelineError;
