export default function FindingCard({ finding, index, onFixClick }) {
  const severityStyles = {
    CRITICAL: {
      bg: 'var(--color-critical-bg)',
      border: 'var(--color-critical-border)',
      color: 'var(--color-critical)',
      icon: '🔴',
    },
    WARNING: {
      bg: 'var(--color-warning-bg)',
      border: 'var(--color-warning-border)',
      color: 'var(--color-warning)',
      icon: '🟡',
    },
    INFO: {
      bg: 'var(--color-info-bg)',
      border: 'var(--color-info-border)',
      color: 'var(--color-info)',
      icon: '🔵',
    },
  };

  const style = severityStyles[finding.severity] || severityStyles.INFO;

  return (
    <div
      className="finding-card animate-fade-in-up"
      style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--color-border-muted)',
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'backwards',
      }}
    >
      {/* Severity + Title Row */}
      <div className="flex items-start gap-2 mb-1.5">
        <span className="badge" style={{
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          color: style.color,
          flexShrink: 0,
        }}>
          {style.icon} {finding.severity}
        </span>
        <span className="text-xs font-semibold" style={{
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-mono)',
          lineHeight: '1.5',
        }}>
          {finding.title}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs mb-2" style={{
        color: 'var(--color-text-secondary)',
        lineHeight: '1.5',
        paddingLeft: '4px',
      }}>
        {finding.description}
      </p>

      {/* Line numbers + Fix button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {finding.line_numbers && finding.line_numbers.length > 0 && (
            <span className="text-xs font-mono" style={{
              color: 'var(--color-text-muted)',
              fontSize: '10px',
            }}>
              Lines: {finding.line_numbers.join(', ')}
            </span>
          )}
          <span className="text-xs font-mono" style={{
            color: 'var(--color-text-muted)',
            fontSize: '10px',
            opacity: 0.6,
          }}>
            {finding.type.replace(/_/g, ' ')}
          </span>
        </div>

        <button
          className="btn"
          onClick={() => onFixClick(finding)}
          style={{
            fontSize: '10px',
            padding: '3px 8px',
            color: style.color,
            borderColor: style.border,
          }}
        >
          Fix with AI →
        </button>
      </div>
    </div>
  );
}
