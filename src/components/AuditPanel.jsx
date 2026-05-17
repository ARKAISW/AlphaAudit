import FindingCard from './FindingCard';

export default function AuditPanel({ findings, status, error, onFixClick }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="panel-header" style={{ flexShrink: 0 }}>
        <span>
          Audit Findings
          {findings.length > 0 && (
            <span style={{ marginLeft: '8px', color: 'var(--color-text-muted)' }}>
              ({findings.length})
            </span>
          )}
        </span>
        {findings.length > 0 && (
          <div className="flex gap-1">
            {['CRITICAL', 'WARNING', 'INFO'].map(sev => {
              const count = findings.filter(f => f.severity === sev).length;
              if (count === 0) return null;
              const colors = {
                CRITICAL: 'var(--color-critical)',
                WARNING: 'var(--color-warning)',
                INFO: 'var(--color-info)',
              };
              return (
                <span key={sev} className="text-xs font-mono"
                  style={{ color: colors[sev], fontSize: '10px' }}>
                  {count}{sev[0]}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {status === 'idle' && findings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
            <div className="text-4xl opacity-20">α</div>
            <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              Paste a trading strategy and click<br />
              <strong style={{ color: 'var(--color-text-secondary)' }}>Run Audit</strong> to analyze
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-full gap-3 scanner">
            <div className="text-xl animate-pulse" style={{ color: 'var(--color-info)' }}>⟳</div>
            <p className="text-xs font-mono" style={{ color: 'var(--color-info)' }}>
              Analyzing strategy...
            </p>
            <div className="w-48 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
              <div className="h-full rounded-full animate-pulse"
                style={{
                  width: '60%',
                  background: 'linear-gradient(90deg, var(--color-info), transparent)',
                }}
              />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-6">
            <span className="text-2xl">⚠</span>
            <p className="text-xs text-center" style={{ color: 'var(--color-critical)' }}>
              {error || 'Audit failed'}
            </p>
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              Check your API key and try again
            </p>
          </div>
        )}

        {status === 'success' && findings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-6">
            <span className="text-2xl">✓</span>
            <p className="text-xs font-mono" style={{ color: 'var(--color-success)' }}>
              No issues found
            </p>
          </div>
        )}

        {findings.length > 0 && findings.map((finding, i) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            index={i}
            onFixClick={onFixClick}
          />
        ))}
      </div>
    </div>
  );
}
