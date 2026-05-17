import Editor, { DiffEditor } from '@monaco-editor/react';

export default function FixDrawer({ finding, fixedCode, status, error, fullCode, onAccept, onClose }) {
  if (!finding) return null;

  // Get the original lines around the finding
  const getOriginalSnippet = () => {
    if (!finding.line_numbers || finding.line_numbers.length === 0) {
      return finding.code_snippet || '';
    }

    const lines = fullCode.split('\n');
    const startLine = Math.max(0, Math.min(...finding.line_numbers) - 3);
    const endLine = Math.min(lines.length, Math.max(...finding.line_numbers) + 3);
    return lines.slice(startLine, endLine).join('\n');
  };

  const originalSnippet = getOriginalSnippet();

  const handleAccept = () => {
    if (fixedCode && finding.line_numbers && finding.line_numbers.length > 0) {
      onAccept(finding, fixedCode);
    }
    onClose();
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <div className="flex items-center gap-3">
            <span className="badge" style={{
              backgroundColor: finding.severity === 'CRITICAL' ? 'var(--color-critical-bg)' : 'var(--color-warning-bg)',
              border: `1px solid ${finding.severity === 'CRITICAL' ? 'var(--color-critical-border)' : 'var(--color-warning-border)'}`,
              color: finding.severity === 'CRITICAL' ? 'var(--color-critical)' : 'var(--color-warning)',
            }}>
              {finding.severity}
            </span>
            <span className="text-sm font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>
              {finding.title}
            </span>
          </div>
          <button
            className="btn"
            onClick={onClose}
            style={{ padding: '4px 8px', fontSize: '11px' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Description */}
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--color-border-muted)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            {finding.description}
          </p>
        </div>

        {/* Diff View */}
        <div className="flex-1 min-h-0">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="text-xl animate-pulse" style={{ color: 'var(--color-info)' }}>⟳</div>
              <p className="text-xs font-mono" style={{ color: 'var(--color-info)' }}>
                Generating fix...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-6">
              <span className="text-2xl">⚠</span>
              <p className="text-xs text-center" style={{ color: 'var(--color-critical)' }}>
                {error || 'Failed to generate fix'}
              </p>
            </div>
          )}

          {status === 'ready' && (
            <div className="h-full flex flex-col">
              <div className="panel-header" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <span>Original → Fixed</span>
              </div>
              <div className="flex-1">
                <DiffEditor
                  height="100%"
                  language="python"
                  original={originalSnippet}
                  modified={fixedCode}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    renderSideBySide: true,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {status === 'ready' && (
          <div className="flex items-center justify-end gap-2 px-4 py-3"
            style={{ borderTop: '1px solid var(--color-border-default)' }}>
            <button className="btn" onClick={onClose}>
              Reject
            </button>
            <button className="btn btn-primary" onClick={handleAccept}>
              ✓ Accept Fix
            </button>
          </div>
        )}
      </div>
    </>
  );
}
