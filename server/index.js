/**
 * Local development API server for AlphaAudit.
 * Proxies requests to Groq API to keep the API key server-side.
 * In production (Vercel), use /api/ serverless functions instead.
 */

import express from 'express';
import Groq from 'groq-sdk';
import { config } from 'dotenv';

config(); // Load .env

const app = express();
app.use(express.json({ limit: '100kb' }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const AUDIT_SYSTEM_PROMPT = `You are AlphaAudit, a senior quantitative researcher reviewing a trading strategy codebase.

Your job is to identify the following issues and return them as structured JSON only.
Do not return prose. Do not wrap in markdown fences. Return only valid JSON in this exact format:

{
  "findings": [
    {
      "id": "finding_1",
      "severity": "CRITICAL",
      "type": "look_ahead_bias",
      "title": "short title",
      "description": "plain English explanation of why this is dangerous",
      "line_numbers": [42, 43],
      "code_snippet": "the offending code",
      "fix_suggestion": "brief description of how to fix"
    }
  ],
  "scores": {
    "alpha_score": 67,
    "bias_risk": "HIGH",
    "code_quality": "MEDIUM"
  },
  "summary": "One-paragraph executive summary of the strategy quality"
}

Check for: look-ahead bias (negative shifts, forward-looking transforms), survivorship bias (static universe), overfitting (too many parameters, no OOS test), Sharpe errors (missing risk-free rate, wrong annualization), missing transaction costs, poor position sizing.

Be thorough. Check every line.`;

const FIX_SYSTEM_PROMPT = `You are AlphaAudit's code repair engine. Fix quantitative trading strategy bugs.
Return ONLY the corrected Python code. No explanation. No markdown fencing. Just fixed Python.`;

// --- Audit Endpoint ---
app.post('/api/audit', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: AUDIT_SYSTEM_PROMPT },
        { role: 'user', content: `Strategy code to review:\n\n${code}` },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0]?.message?.content || '{}';
    res.json({ result });
  } catch (err) {
    console.error('Audit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Fix Endpoint ---
app.post('/api/fix', async (req, res) => {
  try {
    const { code, finding } = req.body;
    if (!code || !finding) return res.status(400).json({ error: 'Missing code or finding' });

    const prompt = `The following Python strategy has this issue: ${finding.description}
Affected lines: ${finding.line_numbers?.join(', ') || 'unknown'}

Full strategy code:
${code}

Return ONLY the corrected code section. No explanation.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: FIX_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    });

    const result = completion.choices[0]?.message?.content || '';
    res.json({ result });
  } catch (err) {
    console.error('Fix error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AlphaAudit API server running on port ${PORT}`);
});
