import { useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  minimap: { enabled: false },
  lineNumbers: 'on',
  renderLineHighlight: 'all',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 8, bottom: 8 },
  bracketPairColorization: { enabled: true },
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  tabSize: 4,
  wordWrap: 'off',
  glyphMargin: true,
  folding: true,
};

// Custom dark theme matching AlphaAudit's aesthetic
const ALPHA_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '484f58', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'ff7b72' },
    { token: 'string', foreground: 'a5d6ff' },
    { token: 'number', foreground: '79c0ff' },
    { token: 'type', foreground: 'ffa657' },
    { token: 'function', foreground: 'd2a8ff' },
    { token: 'variable', foreground: 'ffa657' },
    { token: 'operator', foreground: 'ff7b72' },
    { token: 'decorator', foreground: 'ffa657' },
  ],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#e6edf3',
    'editor.lineHighlightBackground': '#161b2240',
    'editor.selectionBackground': '#264f7840',
    'editorCursor.foreground': '#58a6ff',
    'editorLineNumber.foreground': '#484f58',
    'editorLineNumber.activeForeground': '#e6edf3',
    'editor.inactiveSelectionBackground': '#264f7820',
    'editorIndentGuide.background': '#21262d',
    'editorIndentGuide.activeBackground': '#30363d',
    'editorGutter.background': '#0d1117',
  },
};

export default function StrategyEditor({ code, onChange, findings }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom theme
    monaco.editor.defineTheme('alpha-dark', ALPHA_THEME);
    monaco.editor.setTheme('alpha-dark');
  }, []);

  // Update line decorations when findings change
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !findings) return;

    const newDecorations = [];

    findings.forEach(finding => {
      if (!finding.line_numbers || finding.line_numbers.length === 0) return;

      const className = finding.severity === 'CRITICAL'
        ? 'finding-decoration-critical'
        : finding.severity === 'WARNING'
          ? 'finding-decoration-warning'
          : 'finding-decoration-info';

      const glyphClass = finding.severity === 'CRITICAL'
        ? 'finding-glyph-critical'
        : finding.severity === 'WARNING'
          ? 'finding-glyph-warning'
          : 'finding-glyph-info';

      finding.line_numbers.forEach(line => {
        newDecorations.push({
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className,
            glyphMarginClassName: glyphClass,
            hoverMessage: {
              value: `**${finding.severity}**: ${finding.title}\n\n${finding.description}`,
            },
          },
        });
      });
    });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [findings]);

  return (
    <div className="monaco-container" style={{ position: 'relative' }}>
      <style>{`
        .finding-decoration-critical {
          background-color: rgba(248, 81, 73, 0.08) !important;
          border-left: 3px solid #f85149 !important;
        }
        .finding-decoration-warning {
          background-color: rgba(210, 153, 34, 0.08) !important;
          border-left: 3px solid #d29922 !important;
        }
        .finding-decoration-info {
          background-color: rgba(88, 166, 255, 0.05) !important;
          border-left: 3px solid #58a6ff !important;
        }
        .finding-glyph-critical::before { content: '🔴'; font-size: 10px; }
        .finding-glyph-warning::before { content: '🟡'; font-size: 10px; }
        .finding-glyph-info::before { content: '🔵'; font-size: 10px; }
      `}</style>
      <Editor
        height="100%"
        language="python"
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={EDITOR_OPTIONS}
        loading={
          <div className="flex items-center justify-center h-full"
            style={{ backgroundColor: '#0d1117', color: 'var(--color-text-secondary)' }}>
            <span className="font-mono text-xs">Loading editor...</span>
          </div>
        }
      />
    </div>
  );
}
