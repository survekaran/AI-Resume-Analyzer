import React, { useState, useCallback } from 'react';
import UploadZone from './components/UploadZone';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import type { ResumeAnalysis, AnalysisStep } from './types';
import { extractText } from './extractor';
import { analyzeResume } from './analyzer';

// ── helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

type AppState = 'upload' | 'processing' | 'results' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [step, setStep]         = useState<AnalysisStep>('idle');
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setAppState('processing');
    setErrorMsg('');

    try {
      // Step 1 — extract
      setStep('extracting');
      await sleep(600);
      const text = await extractText(file);

      if (!text || text.trim().length < 30) {
        throw new Error('Could not extract enough text from this file. Please ensure the resume has selectable text (not a scanned image).');
      }

      // Step 2 — parse
      setStep('parsing');
      await sleep(800);

      // Step 3 — score
      setStep('scoring');
      await sleep(700);
      const result = analyzeResume(text);

      // Step 4 — done
      setStep('done');
      await sleep(500);

      setAnalysis(result);
      setAppState('results');
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
      setAppState('error');
    }
  }, []);

  const handleReset = () => {
    setAppState('upload');
    setStep('idle');
    setAnalysis(null);
    setFileName('');
    setErrorMsg('');
  };

  return (
    <>
      <div className="bg-mesh" aria-hidden="true" />

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="container navbar-inner">
          <a className="logo" href="/" aria-label="ResumeAI home">
            <div className="logo-icon" aria-hidden="true">🤖</div>
            ResumeAI
          </a>
          <span className="nav-badge">✨ AI-Powered</span>
        </div>
      </nav>

      <main>
        <div className="container">

          {/* ── Hero ──────────────────────────────────────────────────── */}
          {appState === 'upload' && (
            <header className="hero">
              <div className="hero-tag" aria-label="Feature tag">
                🚀 Smart Resume Analysis
              </div>
              <h1>
                Get Your Resume<br />
                <span>AI-Analyzed in Seconds</span>
              </h1>
              <p>
                Upload your resume and instantly receive a detailed report — skill gaps,
                ATS score, strengths, actionable tips, and more. Land more interviews.
              </p>

              <div className="stats-row" role="list" aria-label="Product statistics">
                {[
                  { value: '50+',  label: 'Skills Detected' },
                  { value: '5',    label: 'Score Dimensions' },
                  { value: '100%', label: 'Private & Secure' },
                  { value: '< 3s', label: 'Analysis Time' },
                ].map(stat => (
                  <div key={stat.label} className="stat-item" role="listitem">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </header>
          )}

          {/* ── Views ─────────────────────────────────────────────────── */}
          {appState === 'upload' && (
            <UploadZone onFile={handleFile} />
          )}

          {appState === 'processing' && (
            <div style={{ padding: '40px 0 100px' }}>
              <ProcessingView step={step} fileName={fileName} />
            </div>
          )}

          {appState === 'results' && analysis && (
            <ResultsView
              analysis={analysis}
              fileName={fileName}
              onReset={handleReset}
            />
          )}

          {appState === 'error' && (
            <div
              className="processing-card"
              style={{ textAlign: 'center', padding: '60px 36px' }}
              role="alert"
            >
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>😕</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', marginBottom: 12 }}>
                Analysis Failed
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 28px' }}>
                {errorMsg}
              </p>
              <button id="try-again-btn" className="btn-primary" onClick={handleReset}>
                🔄 Try Again
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="footer">
        <p>
          Built with <span>❤️</span> by <span>ResumeAI</span> ·
          All processing happens <span>locally in your browser</span> — your data never leaves your device.
        </p>
      </footer>
    </>
  );
};

export default App;
