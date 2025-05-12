import React from 'react';
import { Globe } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  totalQuestions: number; // Total questions in the *current* level
  currentQuestion: number; // Current question number *within* the current level
  level: number; // The current level number (e.g., 1, 2, 3)
}

// Define styles as JavaScript objects (keeping the previous inline styles)
const containerStyle: React.CSSProperties = {
    backgroundColor: '#1d4ed8', // Corresponds to Tailwind's blue-700
    color: '#fff', // text-white
    padding: '1rem', // p-4 (16px)
    borderRadius: '0.5rem', // rounded-lg (8px)
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Simplified shadow-md
    width: '100%', // Take full width of its grid column
    boxSizing: 'border-box', // Include padding in width
    display: 'flex', // Ensure flex layout for inner content
    flexDirection: 'column', // Stack content vertically if needed, though justify-between makes it horizontal
    justifyContent: 'space-between', // Title/Level on left, numbers on right
    alignItems: 'center', // Center vertically
};

const flexRowBetweenCenter: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', // Ensure inner flex takes full width
};

const flexCenter: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
};

const globeIconStyle: React.CSSProperties = {
    marginRight: '0.75rem', // mr-3 (12px)
    opacity: 0.9, // opacity-90
};

// Style for the main title and level container on the left
const titleAndLevelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Vertically center text if heights differ
};

const titleStyle: React.CSSProperties = {
    fontSize: '1.25rem', // text-xl
    fontWeight: 'bold',
};

const levelStyle: React.CSSProperties = {
    fontSize: '0.875rem', // text-sm
    fontWeight: '500',
    opacity: 0.9,
    marginTop: '0.25rem', // Small gap between title and level
};


const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem', // space-x-6 (24px) - using gap for spacing in flex container
    color: 'rgba(255, 255, 255, 0.9)', // text-white/90
};

const textCenterStyle: React.CSSProperties = {
    textAlign: 'center',
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem', // text-sm (14px)
    textTransform: 'uppercase',
    fontWeight: '500', // font-medium
    opacity: 0.8, // opacity-80
};

const valueStyle: React.CSSProperties = {
    fontSize: '1.25rem', // text-xl (20px)
    fontWeight: 'bold',
};


export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  totalQuestions,
  currentQuestion,
  level
}) => {
  return (
    <div style={containerStyle}>
      {/* Inner flex container for main layout */}
      <div style={flexRowBetweenCenter}>
        {/* Left side: Icon, Title, and Level */}
        <div style={flexCenter}>
           <Globe size={28} style={globeIconStyle} />
           <div style={titleAndLevelStyle}>
             <h1 style={titleStyle}>Country Landmark Challenge</h1>
             <p style={levelStyle}>Level {level}</p> {/* Display current level */}
           </div>
        </div>

        {/* Right side: Question and Score */}
        <div style={rightSectionStyle}>
          {/* Question Display (within current level) */}
          <div style={textCenterStyle}>
            <p style={labelStyle}>Question</p>
            {/* Display current question number within the level */}
            <p style={valueStyle}>{currentQuestion} / {totalQuestions}</p>
          </div>

          {/* Score Display (total score) */}
          <div style={textCenterStyle}>
            <p style={labelStyle}>Score</p>
            <p style={valueStyle}>{score}</p>
          </div>
        </div>
      </div>
    </div>
  );
};