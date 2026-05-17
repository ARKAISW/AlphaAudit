import { useState, useCallback } from 'react';
import { runAudit } from '../lib/groq';
import { generateEquityCurves } from '../lib/equityGenerator';

export function useAudit() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [findings, setFindings] = useState([]);
  const [scores, setScores] = useState(null);
  const [summary, setSummary] = useState('');
  const [equityData, setEquityData] = useState(null);
  const [error, setError] = useState(null);

  const executeAudit = useCallback(async (code) => {
    if (!code || code.trim().length === 0) {
      setError('No code to audit');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const result = await runAudit(code);
      setFindings(result.findings);
      setScores(result.scores);
      setSummary(result.summary);

      // Generate equity curves based on findings
      const curves = generateEquityCurves(result.findings);
      setEquityData(curves);

      setStatus('success');
    } catch (err) {
      setError(err.message || 'Audit failed');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setFindings([]);
    setScores(null);
    setSummary('');
    setEquityData(null);
    setError(null);
  }, []);

  return {
    status,
    findings,
    scores,
    summary,
    equityData,
    error,
    executeAudit,
    reset,
  };
}
