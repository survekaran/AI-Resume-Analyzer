import React, { useEffect, useRef } from 'react';
import type { ResumeAnalysis } from '../types';
import ScoreRing from './ScoreRing';

interface ResultsViewProps {
  analysis: ResumeAnalysis;
  fileName: string;
  onReset: () => void;
}

// ── tiny helpers ─────────────────────────────────────────────────────────────
const SectionTitle: React.FC<{ icon: string; label: string; bg: string }> = ({ icon, label, bg }) => (
  <div className="section-title">
    <span className="section-title-icon" style={{ background: bg }}>{icon}</span>
    {label}
  </div>
);

const AnimatedBar: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = '0%';
    const raf = requestAnimationFrame(() => {
      setTimeout(() => { el.style.width = `${score}%`; }, 80);
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="bar-track">
      <div ref={ref} className={`bar-fill ${color}`} style={{ width: '0%' }} />
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const ResultsView: React.FC<ResultsViewProps> = ({ analysis, fileName, onReset }) => {
  const {
    overallScore, grade, gradeLabel,
    extractedSkills, missingKeywords,
    workExperience, education,
    strengths, weaknesses, actionableTips,
    breakdown, wordCount,
  } = analysis;

  // Animate entry
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.style.transition = 'opacity .6s ease, transform .6s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    });
  }, []);

  const handleDownload = () => {
    const lines = [
      `ResumeAI Analysis Report`,
      `File: ${fileName}`,
      `Overall Score: ${overallScore}/100  (${gradeLabel})`,
      ``,
      `--- SCORE BREAKDOWN ---`,
      ...breakdown.map(b => `${b.label}: ${b.score}/100`),
      ``,
      `--- SKILLS DETECTED (${extractedSkills.length}) ---`,
      extractedSkills.join(', '),
      ``,
      `--- MISSING KEYWORDS ---`,
      missingKeywords.join(', '),
      ``,
      `--- STRENGTHS ---`,
      ...strengths.map(s => `• ${s}`),
      ``,
      `--- AREAS TO IMPROVE ---`,
      ...weaknesses.map(w => `• ${w}`),
      ``,
      `--- ACTIONABLE TIPS ---`,
      ...actionableTips.map((t, i) => `${i + 1}. ${t}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="results-section">
      <div ref={containerRef}>

        {/* ── Score Banner ─────────────────────────────────────────────── */}
        <div className="score-banner">
          <div className="score-left">
            <h2>Resume Analysis Report</h2>
            <p>
              Analyzed <strong>{fileName}</strong> · {wordCount} words · {extractedSkills.length} skills detected
            </p>
            <div className={`grade-pill ${grade}`} style={{ marginTop: 14 }}>
              {gradeLabel}
            </div>
          </div>
          <ScoreRing score={overallScore} size={120} />
        </div>

        {/* ── Score Breakdown ───────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <SectionTitle icon="📊" label="Score Breakdown" bg="rgba(99,102,241,.15)" />
          <div className="breakdown-list">
            {breakdown.map(b => (
              <div key={b.label} className="breakdown-item">
                <label>
                  {b.label}
                  <span>{b.score}/100</span>
                </label>
                <AnimatedBar score={b.score} color={b.color === 'default' ? '' : b.color} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Results Grid ──────────────────────────────────────────────── */}
        <div className="results-grid">

          {/* Skills Found */}
          <div className="card">
            <SectionTitle icon="⚡" label={`Skills Detected (${extractedSkills.length})`} bg="rgba(99,102,241,.15)" />
            {extractedSkills.length > 0 ? (
              <div className="tag-list">
                {extractedSkills.map(s => (
                  <span key={s} className="tag found">{s}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '.88rem' }}>
                No specific skills detected. Try adding a "Skills" section.
              </p>
            )}
          </div>

          {/* Missing Keywords */}
          <div className="card">
            <SectionTitle icon="🔑" label="Missing Keywords" bg="rgba(244,63,94,.12)" />
            {missingKeywords.length > 0 ? (
              <div className="tag-list">
                {missingKeywords.map(k => (
                  <span key={k} className="tag missing">{k}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--emerald)', fontSize: '.88rem' }}>
                ✅ Great keyword coverage! No critical gaps found.
              </p>
            )}
          </div>

          {/* Strengths */}
          <div className="card">
            <SectionTitle icon="💪" label="Strengths" bg="rgba(16,185,129,.12)" />
            <ul className="insight-list">
              {strengths.map((s, i) => (
                <li key={i} className="insight-item strength">
                  <span className="insight-icon">✅</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="card">
            <SectionTitle icon="⚠️" label="Areas to Improve" bg="rgba(244,63,94,.12)" />
            <ul className="insight-list">
              {weaknesses.length > 0 ? weaknesses.map((w, i) => (
                <li key={i} className="insight-item weakness">
                  <span className="insight-icon">❌</span>
                  {w}
                </li>
              )) : (
                <li className="insight-item strength">
                  <span className="insight-icon">🎉</span>
                  No major weaknesses found — great resume!
                </li>
              )}
            </ul>
          </div>

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <div className="card">
              <SectionTitle icon="💼" label="Work Experience" bg="rgba(20,184,166,.12)" />
              <div className="timeline">
                {workExperience.map((exp, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-role">{exp.role}</div>
                    <div className="timeline-company">{exp.company}</div>
                    <div className="timeline-period">🗓 {exp.period}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="card">
              <SectionTitle icon="🎓" label="Education" bg="rgba(245,158,11,.12)" />
              <div className="timeline">
                {education.map((edu, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-role">{edu.degree}</div>
                    <div className="timeline-company">{edu.institution}</div>
                    <div className="timeline-period">🗓 {edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Tips */}
          <div className="card full-width">
            <SectionTitle icon="💡" label="Actionable Tips to Improve Your Score" bg="rgba(245,158,11,.12)" />
            <ul className="insight-list">
              {actionableTips.map((tip, i) => (
                <li key={i} className="insight-item tip">
                  <span className="insight-icon">🔹</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        <div className="actions-row">
          <button id="download-btn" className="btn-primary" onClick={handleDownload}>
            <span>⬇️</span> Download Report
          </button>
          <button id="analyze-another-btn" className="btn-secondary" onClick={onReset}>
            <span>🔄</span> Analyze Another Resume
          </button>
        </div>

      </div>
    </section>
  );
};

export default ResultsView;
