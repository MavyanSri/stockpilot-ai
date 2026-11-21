import React, { useState, useEffect } from 'react';

export const IntroSplash = ({ onComplete }) => {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setFading(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div className={`intro-splash-screen ${fading ? 'fade-out' : ''}`}>
      <div className="splash-ambient-glow"></div>
      <div className="splash-scan-line"></div>

      <div className="splash-content">
        <div className="splash-logo-container">
          <div className="splash-cube">
            <div className="cube-face cube-front">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <div className="cube-glow"></div>
          </div>
        </div>

        <div className="splash-brand-title">
          <span className="splash-word splash-stock">STOCK</span>
          <span className="splash-word splash-pilot">PILOT</span>
          <span className="splash-badge">AI</span>
        </div>

        <div className="splash-tagline">
          INTELLIGENT INVENTORY & SUPPLY CHAIN ENGINE
        </div>

        <div className="splash-progress-track">
          <div 
            className="splash-progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="splash-status-text">
          <span>Initializing Real-Time Warehouse Engine...</span>
          <span>{progress}%</span>
        </div>
      </div>

      <button className="splash-skip-btn" onClick={handleSkip} title="Skip animation">
        Skip Intro &rarr;
      </button>
    </div>
  );
};
