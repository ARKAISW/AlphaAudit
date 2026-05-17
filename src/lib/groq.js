/**
 * Groq API client for AlphaAudit.
 * Handles audit and fix requests to the Groq Llama API.
 */

import { AUDIT_SYSTEM_PROMPT, FIX_SYSTEM_PROMPT } from './prompts';
import { extractJSON, validateAuditResponse } from './responseParser';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Run a full audit on strategy code.
 * @param {string} code - The Python strategy code to audit
 * @returns {Promise<{findings: Array, scores: Object, summary: string}>}
 */
export async function runAudit(code) {
  if (!code || code.trim().length === 0) {
    throw new Error('No code provided for audit');
  }

  const response = await fetch(`${API_BASE}/api/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Audit failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // The API route returns the raw LLM text — parse it
  if (typeof data.result === 'string') {
    const parsed = extractJSON(data.result);
    return validateAuditResponse(parsed);
  }

  // Or the API route already parsed it
  return validateAuditResponse(data.result || data);
}

/**
 * Request a code fix for a specific finding.
 * @param {string} fullCode - The full strategy code
 * @param {Object} finding - The finding to fix
 * @returns {Promise<string>} - The fixed code snippet
 */
export async function requestFix(fullCode, finding) {
  const response = await fetch(`${API_BASE}/api/fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: fullCode,
      finding: {
        title: finding.title,
        description: finding.description,
        line_numbers: finding.line_numbers,
        type: finding.type,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fix request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  let fixedCode = data.result || data.fixed_code || '';

  // Clean markdown fences if the LLM wrapped it
  fixedCode = fixedCode.replace(/^```(?:python)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');

  return fixedCode.trim();
}
