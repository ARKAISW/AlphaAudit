import { useState, useCallback } from 'react';
import { requestFix } from '../lib/groq';

export function useFix() {
  const [activeFinding, setActiveFinding] = useState(null);
  const [fixedCode, setFixedCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState(null);

  const requestFixForFinding = useCallback(async (fullCode, finding) => {
    setActiveFinding(finding);
    setStatus('loading');
    setError(null);

    try {
      const result = await requestFix(fullCode, finding);
      setFixedCode(result);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Fix generation failed');
      setStatus('error');
    }
  }, []);

  const close = useCallback(() => {
    setActiveFinding(null);
    setFixedCode('');
    setStatus('idle');
    setError(null);
  }, []);

  return {
    activeFinding,
    fixedCode,
    status,
    error,
    requestFixForFinding,
    close,
  };
}
