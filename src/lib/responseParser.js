/**
 * Robust JSON response parser for LLM outputs.
 * Handles markdown fences, malformed JSON, and partial responses.
 */

/**
 * Extract JSON from an LLM response that may contain markdown fences,
 * prose before/after, or other wrapping.
 */
export function extractJSON(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return null;
  }

  let text = rawResponse.trim();

  // Try 1: Direct parse (ideal case — LLM returned pure JSON)
  try {
    return JSON.parse(text);
  } catch {
    // continue to extraction strategies
  }

  // Try 2: Extract from markdown code fences ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // continue
    }
  }

  // Try 3: Find the first { ... } block (greedy)
  const braceStart = text.indexOf('{');
  const braceEnd = text.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd > braceStart) {
    try {
      return JSON.parse(text.slice(braceStart, braceEnd + 1));
    } catch {
      // continue
    }
  }

  // Try 4: Find the first [ ... ] block (for array responses)
  const bracketStart = text.indexOf('[');
  const bracketEnd = text.lastIndexOf(']');
  if (bracketStart !== -1 && bracketEnd > bracketStart) {
    try {
      return JSON.parse(text.slice(bracketStart, bracketEnd + 1));
    } catch {
      // continue
    }
  }

  return null;
}

/**
 * Validate and normalize the audit response structure.
 */
export function validateAuditResponse(data) {
  if (!data || typeof data !== 'object') {
    return getDefaultResponse('Failed to parse AI response');
  }

  const findings = Array.isArray(data.findings) ? data.findings : [];
  const validFindings = findings
    .map((f, i) => normalizeFinding(f, i))
    .filter(Boolean);

  const scores = normalizeScores(data.scores);
  const summary = typeof data.summary === 'string'
    ? data.summary
    : generateDefaultSummary(validFindings, scores);

  return { findings: validFindings, scores, summary };
}

/**
 * Normalize a single finding object.
 */
function normalizeFinding(finding, index) {
  if (!finding || typeof finding !== 'object') return null;

  const validSeverities = ['CRITICAL', 'WARNING', 'INFO'];
  const validTypes = [
    'look_ahead_bias', 'survivorship_bias', 'overfitting',
    'sharpe_error', 'transaction_costs', 'position_sizing', 'other',
  ];

  const severity = validSeverities.includes(finding.severity?.toUpperCase())
    ? finding.severity.toUpperCase()
    : 'INFO';

  const type = validTypes.includes(finding.type)
    ? finding.type
    : 'other';

  return {
    id: finding.id || `finding_${index + 1}`,
    severity,
    type,
    title: String(finding.title || 'Unnamed Finding'),
    description: String(finding.description || 'No description provided'),
    line_numbers: Array.isArray(finding.line_numbers)
      ? finding.line_numbers.filter(n => typeof n === 'number')
      : [],
    code_snippet: String(finding.code_snippet || ''),
    fix_suggestion: String(finding.fix_suggestion || ''),
  };
}

/**
 * Normalize scores object.
 */
function normalizeScores(scores) {
  if (!scores || typeof scores !== 'object') {
    return { alpha_score: 50, bias_risk: 'MEDIUM', code_quality: 'MEDIUM' };
  }

  const alpha = typeof scores.alpha_score === 'number'
    ? Math.max(0, Math.min(100, Math.round(scores.alpha_score)))
    : 50;

  const validRisks = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const bias_risk = validRisks.includes(scores.bias_risk?.toUpperCase())
    ? scores.bias_risk.toUpperCase()
    : 'MEDIUM';

  const validQualities = ['LOW', 'MEDIUM', 'HIGH'];
  const code_quality = validQualities.includes(scores.code_quality?.toUpperCase())
    ? scores.code_quality.toUpperCase()
    : 'MEDIUM';

  return { alpha_score: alpha, bias_risk, code_quality };
}

/**
 * Generate a default summary from findings.
 */
function generateDefaultSummary(findings, scores) {
  const criticals = findings.filter(f => f.severity === 'CRITICAL').length;
  const warnings = findings.filter(f => f.severity === 'WARNING').length;

  if (criticals > 0) {
    return `Strategy has ${criticals} critical issue(s) that invalidate backtest results. Alpha Score: ${scores.alpha_score}/100.`;
  }
  if (warnings > 0) {
    return `Strategy has ${warnings} warning(s) that may degrade reliability. Alpha Score: ${scores.alpha_score}/100.`;
  }
  return `Strategy appears well-structured with minor suggestions. Alpha Score: ${scores.alpha_score}/100.`;
}

/**
 * Default response when parsing fails entirely.
 */
function getDefaultResponse(error) {
  return {
    findings: [{
      id: 'parse_error',
      severity: 'INFO',
      type: 'other',
      title: 'Analysis Incomplete',
      description: `The AI analysis could not be fully parsed. ${error}. Please try running the audit again.`,
      line_numbers: [],
      code_snippet: '',
      fix_suggestion: '',
    }],
    scores: { alpha_score: 50, bias_risk: 'MEDIUM', code_quality: 'MEDIUM' },
    summary: 'Analysis could not be completed. Please retry.',
  };
}
