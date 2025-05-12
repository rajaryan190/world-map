import React, { useState, useEffect } from 'react';
import { Map } from './Map';
import { Landmark } from './Landmark';
import { ScoreBoard } from './ScoreBoard';
import { gameData as allGameData } from '../data/gameData'; // Renamed to avoid confusion
import { shuffle } from '../utils/helpers';
import { Trophy } from 'lucide-react';

// Define level configuration: number of questions per level
const LEVEL_CONFIG = [
  { count: 10, name: 'Level 1' },
  { count: 25, name: 'Level 2' }, // Note: Requires total of 10 + 25 = 35 questions
  { count: 40, name: 'Level 3' }, // Note: Requires total of 35 + 40 = 75 questions
  // Add more levels as needed, with higher counts
];

// Calculate cumulative question counts for easier level progression tracking
const cumulativeQuestions = LEVEL_CONFIG.reduce((acc, level, index) => {
    const previousTotal = index > 0 ? acc[index - 1] : 0;
    acc.push(previousTotal + level.count);
    return acc;
}, [] as number[]);

export const Game: React.FC = () => {
  // Use state to hold the shuffled list of ALL available game data
  const [shuffledGameData, setShuffledGameData] = useState(shuffle([...allGameData]));
  // State to track the index of the current question in the shuffled list
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // State to track the current level
  const [currentLevel, setCurrentLevel] = useState(0);
  // State to track the player's total score
  const [score, setScore] = useState(0);
  // State to track countries correctly identified
  const [revealedCountries, setRevealedCountries] = useState<string[]>([]);
  // State for feedback messages
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | null, message: string }>({
    status: null,
    message: ''
  });
  // State to track if the game is over
  const [gameOver, setGameOver] = useState(false);
  // State to potentially show level complete message
  const [levelComplete, setLevelComplete] = useState(false);


  // Calculate details for the current level
  const questionsAnsweredBeforeThisLevel = currentLevel > 0 ? cumulativeQuestions[currentLevel - 1] : 0;
  const totalQuestionsInCurrentLevel = LEVEL_CONFIG[currentLevel].count;
  // Index in the shuffled list where the current level ends
  const currentLevelEndIndex = cumulativeQuestions[currentLevel] - 1;
  // The current question number within the current level (1-based index)
  const currentQuestionNumberInLevel = (currentQuestionIndex - questionsAnsweredBeforeThisLevel) + 1;

  // Get the current landmark data based on the global question index
  const currentLandmark = shuffledGameData[currentQuestionIndex];

  // Check if there are enough questions in gameData for the next potential level
  const canAdvanceToNextLevel = (currentLevel + 1) < LEVEL_CONFIG.length &&
                                allGameData.length >= cumulativeQuestions[currentLevel + 1];

  const handleCountryClick = (country: string) => {
    // Prevent interaction if game is over, country already revealed, or feedback is showing
    if (gameOver || revealedCountries.includes(country) || feedback.status !== null || levelComplete) {
      return;
    }

    if (country === currentLandmark.country) {
      setScore(prevScore => prevScore + 1);
      setRevealedCountries(prev => [...prev, country]);
      setFeedback({
        status: 'correct',
        message: `Correct! ${currentLandmark.landmark} is in ${country}.`
      });

      // Determine if this was the last question of the current level
      const isEndOfCurrentLevel = currentQuestionIndex === currentLevelEndIndex;

      // Wait for feedback duration before proceeding
      setTimeout(() => {
        setFeedback({ status: null, message: '' }); // Clear feedback

        if (isEndOfCurrentLevel) {
          // Completed the current level
          if (canAdvanceToNextLevel) {
            // Enough data and config for the next level
            setLevelComplete(true); // Show level complete message briefly
            setCurrentLevel(prevLevel => prevLevel + 1); // Advance level
            // currentQuestionIndex will be incremented below, moving to the start of the next level

            // Hide level complete message after a delay
            setTimeout(() => {
              setLevelComplete(false);
              setCurrentQuestionIndex(prevIndex => prevIndex + 1); // Move to the first question of the next level
            }, 2000); // Show level complete for 2 seconds

          } else {
            // No more levels or not enough data for the next level - Game Over
            setGameOver(true);
          }
        } else {
          // Not the end of the level, just move to the next question
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
      }, 1500); // Duration to show correct feedback

    } else {
      // Incorrect guess
      setFeedback({
        status: 'incorrect',
        message: `Incorrect. Try again!` // Or maybe reveal the correct country here?
      });

      // Wait for feedback duration before clearing feedback
      setTimeout(() => {
        setFeedback({ status: null, message: '' });
      }, 1500); // Duration to show incorrect feedback
    }
  };

  const restartGame = () => {
    setShuffledGameData(shuffle([...allGameData]));
    setCurrentQuestionIndex(0);
    setCurrentLevel(0);
    setScore(0);
    setRevealedCountries([]);
    setFeedback({ status: null, message: '' });
    setGameOver(false);
    setLevelComplete(false);
  };

  // --- Render Logic ---

  // --- Game Over State ---
  if (gameOver) {
    // Determine the highest level reached for the game over message
    const completedLevelIndex = currentLevel; // If game over, it's after attempting this level
    const completedLevelName = LEVEL_CONFIG[completedLevelIndex]?.name || `Level ${completedLevelIndex + 1}`;

    return (
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 animate-fade-in">
        <div className="p-12 text-center bg-gradient-to-b from-blue-50 to-white">
          <div className="mb-8 flex justify-center">
            <Trophy size={80} className="text-yellow-500 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Game Over!</h1>
          <p className="text-2xl text-gray-600 mb-8">
             {/* Adjust message based on whether a level was completed */}
            You completed {completedLevelName} and scored <span className="font-bold text-blue-600">{score}</span> total points!
          </p>
           {/* Add a message if more data is needed for higher levels */}
           {!canAdvanceToNextLevel && LEVEL_CONFIG.length > currentLevel + 1 && allGameData.length < cumulativeQuestions[currentLevel + 1] && (
                <p className="text-lg text-gray-500 mb-8">Add more landmark data to unlock higher levels!</p>
           )}
          <button
            onClick={restartGame}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // --- Level Complete Message (Temporary Overlay) ---
   if (levelComplete) {
       return (
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 animate-fade-in">
                <div className="p-12 text-center bg-gradient-to-b from-green-50 to-white">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-6">Level {currentLevel} Complete!</h1>
                    <p className="text-xl text-gray-600">Getting ready for {LEVEL_CONFIG[currentLevel]?.name}...</p>
                </div>
            </div>
       );
   }


  // --- Main Game UI ---
  return (
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 flex flex-col">

      {/* Top section for the Map */}
      <div className="flex-grow relative w-full overflow-hidden rounded-t-2xl">
         <Map
          onCountryClick={handleCountryClick}
          revealedCountries={revealedCountries}
          correctCountry={currentLandmark?.country} // Pass correct country
         />
      </div>

      {/* Bottom section for Landmark and ScoreBoard */}
      <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Landmark Component - Only render if currentLandmark is available */}
        {currentLandmark && (
             <Landmark
                landmark={currentLandmark}
                feedback={feedback}
             />
        )}


        {/* ScoreBoard Component */}
        <ScoreBoard
          score={score}
          // Pass level-specific question numbers and total for the level
          currentQuestion={currentQuestionNumberInLevel}
          totalQuestions={totalQuestionsInCurrentLevel}
          level={currentLevel + 1} // Pass 1-based level number
        />
      </div>
    </div>
  );
};