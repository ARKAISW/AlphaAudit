import { useEffect, useState } from 'react';

export default function ScoreDashboard({ scores }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!scores) {
      setAnimatedScore(0);
      return;
    }
    // Animate count up
    const target = typeof scores.alpha_score === 'number' ? scores.alpha_score : 0;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedScore(current);
      if (current >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [scores]);

  if (!scores) {
    return (
      <div className="flex items-center justify-center py-5 gap-6"
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border-default)', minHeight: '72px' }}>
        <ScoreCard label="Alpha Score" value="—" sublabel="/100" />
        <ScoreCard label="Bias Risk" value="—" />
        <ScoreCard label="Code Quality" value="—" />
      </div>
    );
  }

  const scoreColor = scores.alpha_score >= 70 ? 'var(--color-success)'
    : scores.alpha_score >= 40 ? 'var(--color-warning)'
    : 'var(--color-critical)';

  const riskColors = {
    LOW: 'var(--color-success)',
    MEDIUM: 'var(--color-warning)',
    HIGH: 'var(--color-critical)',
    CRITICAL: 'var(--color-critical)',
  };

  const qualityColors = {
    LOW: 'var(--color-critical)',
    MEDIUM: 'var(--color-warning)',
    HIGH: 'var(--color-success)',
  };

  return (
    <div className="flex items-center justify-center py-5 gap-6"
      style={{ backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border-default)', minHeight: '72px' }}>
      <ScoreCard
        label="Alpha Score"
        value={animatedScore}
        sublabel="/100"
        valueColor={scoreColor}
      />
      <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--color-border-default)' }} />
      <ScoreCard
        label="Bias Risk"
        value={scores.bias_risk}
        valueColor={riskColors[scores.bias_risk]}
      />
      <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--color-border-default)' }} />
      <ScoreCard
        label="Code Quality"
        value={scores.code_quality}
        valueColor={qualityColors[scores.code_quality]}
      />
    </div>
  );
}

function ScoreCard({ label, value, sublabel, valueColor }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-mono uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted)', fontSize: '10px', letterSpacing: '0.1em', fontWeight: 600 }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono"
          style={{ color: valueColor || 'var(--color-text-primary)' }}>
          {value}
        </span>
        {sublabel && (
          <span className="text-sm font-mono" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
