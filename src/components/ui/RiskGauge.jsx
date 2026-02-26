import React, { useState, useEffect } from 'react';
import './RiskGauge.css';

const RiskGauge = ({ score = 0, animated = true }) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    let current = 0;
    const increment = score / 50;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, 30);

    return () => clearInterval(interval);
  }, [score, animated]);

  const getRiskLevel = (s) => {
    if (s < 30) return { level: 'LOW', color: '#2DC653', emoji: '🟢' };
    if (s < 65) return { level: 'MODERATE', color: '#F4A261', emoji: '🟡' };
    return { level: 'HIGH', color: '#E63946', emoji: '🔴' };
  };

  const risk = getRiskLevel(displayScore);
  const percentage = (displayScore / 100) * 360;

  return (
    <div className="risk-gauge-container">
      <div className="gauge-wrapper">
        <svg className="gauge-svg" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="55" className="gauge-bg" />

          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="55"
            className="gauge-progress"
            style={{
              strokeDasharray: `${(displayScore / 100) * 345} 345`,
            }}
            stroke={risk.color}
          />
        </svg>

        {/* Center content */}
        <div className="gauge-content">
          <div className="gauge-emoji">{risk.emoji}</div>
          <div className="gauge-score">{displayScore}</div>
          <div className="gauge-max">/100</div>
          <div className="gauge-label" style={{ color: risk.color }}>
            {risk.level}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
