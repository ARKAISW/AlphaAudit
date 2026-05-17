import { useState, useCallback } from 'react';
import Header from './components/Header';
import ExampleSelector from './components/ExampleSelector';
import StrategyEditor from './components/StrategyEditor';
import AuditPanel from './components/AuditPanel';
import EquityCurve from './components/EquityCurve';
import ScoreDashboard from './components/ScoreDashboard';
import FixDrawer from './components/FixDrawer';
import ResizablePanel from './components/ResizablePanel';
import { useAudit } from './hooks/useAudit';
import { useFix } from './hooks/useFix';

const DEFAULT_CODE = `# ====================================================
# Paste your Python trading strategy here
# or load an example from the dropdown above.
# ====================================================
#
# AlphaAudit will analyze your code for:
#   🔴 Look-ahead bias
#   🔴 Survivorship bias
#   🟡 Overfitting indicators
#   🟡 Sharpe ratio errors
#   🟡 Transaction cost neglect
#   🔵 Position sizing issues
#
# Click "Run Audit" to begin.
`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [strategyName, setStrategyName] = useState('');
  const audit = useAudit();
  const fix = useFix();

  const handleRunAudit = useCallback(() => {
    audit.executeAudit(code);
  }, [code, audit]);

  const handleLoadExample = useCallback((exampleCode, name) => {
    setCode(exampleCode);
    setStrategyName(name);
    audit.reset();
  }, [audit]);

  const handleFixClick = useCallback((finding) => {
    fix.requestFixForFinding(code, finding);
  }, [code, fix]);

  const handleAcceptFix = useCallback((finding, fixedCode) => {
    // Replace the affected lines in the editor
    const lines = code.split('\n');
    if (finding.line_numbers && finding.line_numbers.length > 0) {
      const startLine = Math.max(0, Math.min(...finding.line_numbers) - 3);
      const endLine = Math.min(lines.length, Math.max(...finding.line_numbers) + 3);
      const before = lines.slice(0, startLine);
      const after = lines.slice(endLine);
      const newCode = [...before, fixedCode, ...after].join('\n');
      setCode(newCode);
    }
  }, [code]);

  const handleExport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      tool: 'AlphaAudit',
      version: '1.0.0',
      strategy_name: strategyName || 'Unnamed Strategy',
      code,
      findings: audit.findings,
      scores: audit.scores,
      summary: audit.summary,
      equity_stats: audit.equityData?.stats || null,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphaaudit-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, strategyName, audit]);

  return (
    <div className="app-layout">
      {/* Top Bar */}
      <Header
        onRunAudit={handleRunAudit}
        onExport={handleExport}
        isAuditing={audit.status === 'loading'}
        hasResults={audit.status === 'success'}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Left: Code Editor */}
        <div className="editor-panel" style={{ flex: 1, minWidth: 0 }}>
          <div className="panel-header">
            <div className="flex items-center gap-3">
              <ExampleSelector onSelect={handleLoadExample} />
              {strategyName && (
                <span className="text-xs" style={{
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {strategyName}
                </span>
              )}
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>
              Python
            </span>
          </div>
          <StrategyEditor
            code={code}
            onChange={(val) => setCode(val || '')}
            findings={audit.findings}
          />
        </div>

        {/* Right: Audit + Charts */}
        <ResizablePanel
          direction="horizontal"
          defaultSize={440}
          minSize={380}
          maxSize={800}
          className="right-panel"
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Audit Findings */}
            <ResizablePanel
              direction="vertical"
              defaultSize={400}
              minSize={200}
              maxSize={800}
              className="audit-section"
            >
              <AuditPanel
                findings={audit.findings}
                status={audit.status}
                error={audit.error}
                onFixClick={handleFixClick}
              />
            </ResizablePanel>

            {/* Equity Curve */}
            <div className="bottom-section" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <EquityCurve equityData={audit.equityData} />
              <ScoreDashboard scores={audit.scores} />
            </div>
          </div>
        </ResizablePanel>
      </div>

      {/* Fix Drawer */}
      <FixDrawer
        finding={fix.activeFinding}
        fixedCode={fix.fixedCode}
        status={fix.status}
        error={fix.error}
        fullCode={code}
        onAccept={handleAcceptFix}
        onClose={fix.close}
      />
    </div>
  );
}
