class QualityMetrics {
  constructor() {
    this.minPromptLength = 50;
    this.maxPromptLength = 10000;
  }

  evaluate(prompt) {
    const clarity = this.scoreClarity(prompt);
    const completeness = this.scoreCompleteness(prompt);
    const consistency = this.scoreConsistency(prompt);
    const overall = Math.round((clarity.value + completeness.value + consistency.value) / 3);
    
    return { clarity, completeness, consistency, overall };
  }

  scoreClarity(prompt) {
    const score = { value: 0, max: 100, issues: [] };
    
    const hasClearSections = /##\s+\w+/.test(prompt);
    const hasBulletPoints = /^\s*[-*•]/.test(prompt);
    const hasExamples = /\b(example|np\.|np\., np\.)\b/i.test(prompt);
    const hasInstructions = /\b(use|ensure|always|never|avoid|include)\b/i.test(prompt);
    
    if (hasClearSections) score.value += 25;
    else score.issues.push('Brak wyraźnych sekcji (## Tytuł)');
    
    if (hasBulletPoints) score.value += 25;
    else score.issues.push('Brak list punktowanych');
    
    if (hasExamples) score.value += 25;
    else score.issues.push('Brak przykładów');
    
    if (hasInstructions) score.value += 25;
    else score.issues.push('Brak jasnych instrukcji');
    
    return score;
  }

  scoreCompleteness(prompt) {
    const score = { value: 0, max: 100, issues: [] };
    
    const length = prompt.length;
    const hasRole = /\b(you are|role|as a|acting as)\b/i.test(prompt);
    const hasGoal = /\b(goal|objective|purpose|task)\b/i.test(prompt);
    const hasConstraints = /\b(must|should|never|only|limit)\b/i.test(prompt);
    const hasOutputFormat = /\b(format|output|return|respond)\b/i.test(prompt);
    
    if (length >= this.minPromptLength) score.value += 20;
    else score.issues.push('Prompt zbyt krótki');
    
    if (length <= this.maxPromptLength) score.value += 10;
    else score.issues.push('Prompt zbyt długi');
    
    if (hasRole) score.value += 20;
    else score.issues.push('Brak definicji roli');
    
    if (hasGoal) score.value += 20;
    else score.issues.push('Brak jasnego celu');
    
    if (hasConstraints) score.value += 15;
    else score.issues.push('Brak ograniczeń/reguł');
    
    if (hasOutputFormat) score.value += 15;
    else score.issues.push('Brak formatu wyjściowego');
    
    return score;
  }

  scoreConsistency(prompt) {
    const score = { value: 0, max: 100, issues: [] };
    
    const lines = prompt.split('\n').filter(l => l.trim());
    const sections = lines.filter(l => l.startsWith('##'));
    const bullets = lines.filter(l => /^\s*[-*•]/.test(l));
    
    if (sections.length >= 2) score.value += 40;
    else if (sections.length === 1) score.value += 20;
    else score.issues.push('Brak struktury sekcji');
    
    const bulletRatio = bullets.length / Math.max(lines.length, 1);
    if (bulletRatio > 0.1 && bulletRatio < 0.7) score.value += 30;
    else if (bulletRatio > 0) score.value += 15;
    else score.issues.push('Nieoptymalna proporcja list');
    
    const uppercaseLines = lines.filter(l => l === l.toUpperCase() && l.length > 10);
    if (uppercaseLines.length === 0) score.value += 30;
    else score.issues.push('Użycie CAPS LOCK (może być nieczytelne)');
    
    return score;
  }

  calculateOverall(prompt) {
    const { clarity, completeness, consistency } = this.evaluate(prompt);
    return Math.round((clarity.value + completeness.value + consistency.value) / 3);
  }

  getGrade(score) {
    if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'green' };
    if (score >= 60) return { grade: 'B', label: 'Good', color: 'yellow' };
    if (score >= 40) return { grade: 'C', label: 'Needs Work', color: 'orange' };
    return { grade: 'D', label: 'Poor', color: 'red' };
  }

  suggestImprovements(prompt) {
    const result = this.evaluate(prompt);
    const suggestions = [];
    
    if (result.clarity.issues.length > 0) {
      suggestions.push({ category: 'Jasność', items: result.clarity.issues });
    }
    if (result.completeness.issues.length > 0) {
      suggestions.push({ category: 'Kompletność', items: result.completeness.issues });
    }
    if (result.consistency.issues.length > 0) {
      suggestions.push({ category: 'Spójność', items: result.consistency.issues });
    }
    
    return suggestions;
  }
}

module.exports = QualityMetrics;
