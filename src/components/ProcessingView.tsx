import React, { useEffect, useState } from 'react';
import type { AnalysisStep } from '../types';

interface ProcessingViewProps {
  step: AnalysisStep;
  fileName: string;
}

const STEPS: { key: AnalysisStep; label: string; icon: string }[] = [
  { key: 'extracting', label: 'Extracting text from document…', icon: '📄' },
  { key: 'parsing',    label: 'Parsing sections & identifying content…', icon: '🔍' },
  { key: 'scoring',   label: 'Scoring & generating insights…', icon: '🤖' },
  { key: 'done',      label: 'Analysis complete!', icon: '✅' },
];

const ProcessingView: React.FC<ProcessingViewProps> = ({ step, fileName }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const currentIdx = STEPS.findIndex(s => s.key === step);

  return (
    <div
      className="processing-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity .5s ease, transform .5s ease',
      }}
    >
      <div className="spinner-ring" />

      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>
        Analyzing your resume
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
        📂 <strong style={{ color: 'var(--text-primary)' }}>{fileName}</strong>
      </p>

      <ul className="processing-steps">
        {STEPS.map((s, idx) => {
          const isDone   = idx < currentIdx || step === 'done';
          const isActive = idx === currentIdx && step !== 'done';
          return (
            <li
              key={s.key}
              className={isDone ? 'done' : isActive ? 'active' : ''}
            >
              <span className="step-dot" />
              <span>{s.icon}&nbsp;&nbsp;{s.label}</span>
              {isDone && <span style={{ marginLeft: 'auto', fontSize: '.8rem' }}>✓</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProcessingView;
