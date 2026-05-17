import { useState } from 'react';
import { getStrategyNames, getStrategyById } from '../lib/exampleStrategies';

export default function ExampleSelector({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const strategies = getStrategyNames();

  const handleSelect = (id) => {
    const strategy = getStrategyById(id);
    if (strategy) {
      onSelect(strategy.code, strategy.name);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontSize: '11px' }}
      >
        <span>📋</span>
        Load Example
        <span style={{ fontSize: '9px', opacity: 0.6 }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-80 animate-fade-in"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '2px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
            {strategies.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s.id)}
                className="w-full text-left px-3 py-2.5 transition-colors"
                style={{
                  borderBottom: i < strategies.length - 1 ? '1px solid var(--color-border-muted)' : 'none',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-bg-tertiary)'}
                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
              >
                <div className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {s.name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>
                  {s.description}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
