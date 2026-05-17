import Groq from 'groq-sdk';

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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

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
    return res.status(200).json({ result });
  } catch (err) {
    console.error('Audit API error:', err);
    return res.status(500).json({ error: err.message || 'Audit failed' });
  }
}
