import { useState } from 'react';
import { getStrategyNames } from '../lib/exampleStrategies';

export default function Header({ onRunAudit, onExport, isAuditing, hasResults }) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b"
      style={{ 
        borderColor: 'var(--color-border-default)', 
        backgroundColor: 'var(--color-bg-secondary)' 
      }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ 
            fontFamily: 'var(--font-mono)',
            background: 'linear-gradient(135deg, #58a6ff, #79c0ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>α</span>
          <span className="font-semibold text-base tracking-tight"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            AlphaAudit
          </span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-sm"
          style={{ 
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--color-accent-glow)', 
            color: 'var(--color-accent)',
            border: '1px solid rgba(121, 192, 255, 0.2)',
          }}>
          v1.0
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn btn-primary"
          onClick={onRunAudit}
          disabled={isAuditing}
        >
          {isAuditing ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <span>▶</span>
              Run Audit
            </>
          )}
        </button>

        {hasResults && (
          <button className="btn" onClick={onExport}>
            <span>↓</span>
            Export Report
          </button>
        )}
      </div>
    </header>
  );
}
