import React from 'react';

interface ScoreRingProps {
  score: number;   // 0-100
  size?: number;
}

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 120 }) => {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#6366f1' :
    score >= 40 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="score-ring-wrap">
      <svg
        className="ring-svg"
        width={size}
        height={size}
        viewBox="0 0 110 110"
      >
        <circle className="ring-bg" cx="55" cy="55" r={RADIUS} />
        <circle
          className="ring-fill"
          cx="55"
          cy="55"
          r={RADIUS}
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div className="score-ring-label">
        <span className="score-ring-value" style={{ color }}>{score}</span>
        <span className="score-ring-sub">/ 100</span>
      </div>
    </div>
  );
};

export default ScoreRing;
