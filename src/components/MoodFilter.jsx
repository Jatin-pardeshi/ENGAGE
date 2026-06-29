import React, { useState } from 'react';
import './MoodFilter.css';

const MOODS = ['All', 'Chill', 'Hype', 'Learn', 'Funny', 'Deep'];

const MoodFilter = () => {
  const [activeMood, setActiveMood] = useState('All');

  return (
    <div className="mood-filter-container">
      <div className="mood-filter-scroll">
        {MOODS.map(mood => (
          <button
            key={mood}
            className={`brutalist-button mood-btn ${activeMood === mood ? 'active' : ''}`}
            onClick={() => setActiveMood(mood)}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodFilter;
