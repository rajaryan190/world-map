import React from 'react';
import { Globe, HelpCircle } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  totalQuestions: number;
  currentQuestion: number;
  level: number;
  availableHints: number;
}

// Re-creating Tailwind styles with JS objects (as per original file)
// Consider migrating to Tailwind classes directly in JSX for better maintainability
const containerStyle: React.CSSProperties = {
    backgroundColor: '#1d4ed8', // blue-700
    color: '#fff',
    padding: '1rem', // p-4
    borderRadius: '0.5rem', // rounded-lg
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // shadow-md
    width: '100%',
    boxSizing: 'border-box',
};

const flexRowBetweenCenter: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
};

const flexCenter: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
};

const globeIconStyle: React.CSSProperties = {
    marginRight: '0.75rem', // mr-3
    opacity: 0.9,
};

const titleAndLevelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
};

const titleStyle: React.CSSProperties = {
    fontSize: '1.25rem', // text-xl
    fontWeight: 'bold',
};

const levelStyle: React.CSSProperties = {
    fontSize: '0.875rem', // text-sm
    fontWeight: '500', // font-medium
    opacity: 0.9,
    marginTop: '0.25rem',
};

const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem', // Reduced gap for more items space-x-4
    color: 'rgba(255, 255, 255, 0.9)',
};

const textCenterStyle: React.CSSProperties = {
    textAlign: 'center',
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem', // text-xs for smaller labels
    textTransform: 'uppercase',
    fontWeight: '500',
    opacity: 0.8,
    display: 'block', // Ensure it's block for centering
};

const valueStyle: React.CSSProperties = {
    fontSize: '1.125rem', // text-lg
    fontWeight: 'bold',
};

const hintIconStyle: React.CSSProperties = {
    opacity: 0.8,
    marginRight: '0.25rem', // mr-1
};


export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  totalQuestions,
  currentQuestion,
  level,
  availableHints
}) => {
  return (
    <div style={containerStyle}>
      <div style={flexRowBetweenCenter}>
        <div style={flexCenter}>
           <Globe size={28} style={globeIconStyle} />
           <div style={titleAndLevelStyle}>
             <h1 style={titleStyle}>Country Landmark Challenge</h1>
             <p style={levelStyle}>Level {level}</p>
           </div>
        </div>

        <div style={rightSectionStyle}>
          <div style={textCenterStyle}>
            <p style={labelStyle}>Question</p>
            <p style={valueStyle}>{currentQuestion} / {totalQuestions}</p>
          </div>
          <div style={textCenterStyle}>
            <p style={labelStyle}>Score</p>
            <p style={valueStyle}>{score}</p>
          </div>
          {/* Hints Display */}
          <div style={textCenterStyle}>
             <p style={labelStyle}>
                Hints
            </p>
            <p style={valueStyle}>{availableHints}</p>
          </div>
        </div>
      </div>
    </div>
  );
};