import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const FIX_SYSTEM_PROMPT = `You are AlphaAudit's code repair engine. Fix quantitative trading strategy bugs.
Return ONLY the corrected Python code. No explanation. No markdown fencing. Just fixed Python.`;

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
    const { code, finding } = req.body;
    if (!code || !finding) {
      return res.status(400).json({ error: 'Missing code or finding' });
    }

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
    return res.status(200).json({ result });
  } catch (err) {
    console.error('Fix API error:', err);
    return res.status(500).json({ error: err.message || 'Fix failed' });
  }
}
