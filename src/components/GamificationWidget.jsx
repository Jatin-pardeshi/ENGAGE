import React, { useState, useEffect } from 'react';
import { Fire, Trophy, Star } from '@phosphor-icons/react';
import './GamificationWidget.css';

const GamificationWidget = ({ initialStreak = 1, initialLevel = 1, initialXp = 0, xpMax = 1000 }) => {
  // Simple local gamification logic to drive traffic/engagement
  const [xp, setXp] = useState(initialXp);
  const [level, setLevel] = useState(initialLevel);
  const [streak, setStreak] = useState(initialStreak);
  const [hasReferred, setHasReferred] = useState(false);

  useEffect(() => {
    // Load local storage values
    const storedStreak = localStorage.getItem('engage_streak');
    const storedXp = localStorage.getItem('engage_xp');
    const storedReferred = localStorage.getItem('engage_referred');
    
    if (storedStreak) setStreak(parseInt(storedStreak));
    if (storedXp) setXp(parseInt(storedXp));
    if (storedReferred === 'true') setHasReferred(true);
  }, []);

  // Calculate current level and progress (simplified logic)
  const currentLevel = initialLevel + Math.floor(xp / xpMax);
  const progressPercent = Math.min(100, ((xp % xpMax) / xpMax) * 100);

  return (
    <div className="gamification-widget brutalist-card" data-testid="gamification-widget">
      <div className="widget-header">
        <h3><Trophy size={20} weight="fill" className="icon-gold" /> Your Stats</h3>
      </div>
      
      <div className="stats-grid">
        <div className="stat-box">
          <Fire size={24} weight="fill" className="icon-orange" />
          <div className="stat-info">
            <span className="stat-value">{streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
        
        <div className="stat-box">
          <Star size={24} weight="fill" className="icon-yellow" />
          <div className="stat-info">
            <span className="stat-value">Lvl {currentLevel}</span>
            <span className="stat-label">{xp} XP</span>
          </div>
        </div>
      </div>

      <div className="xp-bar-container">
        <div className="xp-bar-labels">
          <span>Progress to next Level</span>
          <span>{xp % xpMax} / {xpMax}</span>
        </div>
        <div className="xp-bar-bg">
          <div className="xp-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {!hasReferred && (
        <div style={{marginTop: '1rem', textAlign: 'center'}}>
          <button 
            className="brutalist-button pink" 
            style={{width: '100%', fontSize: '0.9rem'}}
            onClick={() => {
              const newXp = xp + 500;
              setXp(newXp);
              setHasReferred(true);
              localStorage.setItem('engage_xp', newXp);
              localStorage.setItem('engage_referred', 'true');
              alert("Invitation sent! You earned 500 XP!");
            }}
          >
            🎁 Refer a Friend (+500 XP)
          </button>
        </div>
      )}
    </div>
  );
};

export default GamificationWidget;
