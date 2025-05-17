import React, { useState, useEffect, useCallback } from 'react';
import { Map } from './Map';
import { Landmark } from './Landmark';
import { ScoreBoard } from './ScoreBoard';
import { gameData as allGameData } from '../data/gameData';
import { shuffle, calculateDistance, calculateBearing, getDirection } from '../utils/helpers'; // Added calculation helpers
import { LandmarkData } from '../types';
import { Trophy, HelpCircle } from 'lucide-react';

// Define level configuration: number of questions per level
const LEVEL_CONFIG = [
  { count: 10, name: 'Level 1' },
  { count: 25, name: 'Level 2' },
  { count: 40, name: 'Level 3' },
];

const cumulativeQuestions = LEVEL_CONFIG.reduce((acc, level, index) => {
    const previousTotal = index > 0 ? acc[index - 1] : 0;
    acc.push(previousTotal + level.count);
    return acc;
}, [] as number[]);

// Define Hint Types
export type HintCategory = 'flag' | 'continent' | 'neighbors' | 'language';
export interface ActiveHint {
  category: HintCategory;
  text: string;
  imageUrl?: string; // For flag
}

const INITIAL_HINTS_PER_LEVEL = 5;

export const Game: React.FC = () => {
  const [shuffledGameData, setShuffledGameData] = useState<LandmarkData[]>(() => shuffle([...allGameData]));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [revealedCountries, setRevealedCountries] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | null, message: string }>({
    status: null,
    message: ''
  });
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);

  const [availableHints, setAvailableHints] = useState(INITIAL_HINTS_PER_LEVEL);
  const [activeHint, setActiveHint] = useState<ActiveHint | null>(null);
  const [shownHintsForCurrentQuestion, setShownHintsForCurrentQuestion] = useState<HintCategory[]>([]);

  const questionsAnsweredBeforeThisLevel = currentLevel > 0 ? cumulativeQuestions[currentLevel - 1] : 0;
  const totalQuestionsInCurrentLevel = LEVEL_CONFIG[currentLevel].count;
  const currentLevelEndIndex = cumulativeQuestions[currentLevel] - 1;
  const currentQuestionNumberInLevel = (currentQuestionIndex - questionsAnsweredBeforeThisLevel) + 1;

  const currentLandmark = shuffledGameData[currentQuestionIndex];

  const canAdvanceToNextLevel = (currentLevel + 1) < LEVEL_CONFIG.length &&
                                allGameData.length >= cumulativeQuestions[currentLevel + 1];

  const advanceQuestionOrLevel = useCallback((isEndOfLevel: boolean) => {
    setActiveHint(null);
    setShownHintsForCurrentQuestion([]);

    if (isEndOfLevel) {
      if (canAdvanceToNextLevel) {
        setLevelComplete(true);
        setAvailableHints(prev => prev + INITIAL_HINTS_PER_LEVEL);
        setCurrentLevel(prevLevel => prevLevel + 1);
        setTimeout(() => {
          setLevelComplete(false);
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }, 2000);
      } else {
        setGameOver(true);
      }
    } else {
      if (currentQuestionIndex + 1 < shuffledGameData.length) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        setGameOver(true);
      }
    }
  }, [canAdvanceToNextLevel, currentQuestionIndex, shuffledGameData.length]);


  const handleCountryClick = (countryName: string, clickedCountryCentroid: [number, number] | null) => {
    if (gameOver || revealedCountries.includes(countryName) || feedback.status !== null || levelComplete || !currentLandmark) {
      return;
    }

    if (countryName === currentLandmark.country) {
      setScore(prevScore => prevScore + 1);
      setRevealedCountries(prev => [...prev, countryName]);
      setFeedback({
        status: 'correct',
        message: `Correct! ${currentLandmark.landmark} is in ${countryName}.`
      });

      const isEndOfCurrentLevel = currentQuestionIndex === currentLevelEndIndex;
      setTimeout(() => {
        setFeedback({ status: null, message: '' });
        advanceQuestionOrLevel(isEndOfCurrentLevel);
      }, 1500);
    } else {
      // Incorrect guess: Provide distance and direction hint if possible
      let incorrectMessage = `Incorrect. That's ${countryName}. Try again!`;
      const targetLat = currentLandmark.latitude;
      const targetLon = currentLandmark.longitude;

      if (typeof targetLat === 'number' && typeof targetLon === 'number' && clickedCountryCentroid) {
        // geoCentroid returns [longitude, latitude], our helpers expect (lat, lon, lat, lon)
        const [clickedLon, clickedLat] = clickedCountryCentroid; 

        const distance = calculateDistance(clickedLat, clickedLon, targetLat, targetLon);
        const bearing = calculateBearing(clickedLat, clickedLon, targetLat, targetLon);
        const direction = getDirection(bearing);
        
        incorrectMessage = `That's ${countryName}. You are approx. ${distance} km ${direction} from the target.`;
      }
      
      setFeedback({
        status: 'incorrect',
        message: incorrectMessage
      });
      setTimeout(() => {
        setFeedback({ status: null, message: '' });
      }, 2500); // Increased timeout for the new, more detailed hint
    }
  };

  const handleHintRequest = () => {
    if (availableHints <= 0 || !currentLandmark || activeHint) {
        return;
    }

    const possibleHints: HintCategory[] = [];
    if (currentLandmark.countryCode && !shownHintsForCurrentQuestion.includes('flag')) possibleHints.push('flag');
    if (currentLandmark.continent && !shownHintsForCurrentQuestion.includes('continent')) possibleHints.push('continent');
    if (currentLandmark.neighbors && currentLandmark.neighbors.length > 0 && !shownHintsForCurrentQuestion.includes('neighbors')) possibleHints.push('neighbors');
    if (currentLandmark.languages && currentLandmark.languages.length > 0 && !shownHintsForCurrentQuestion.includes('language')) possibleHints.push('language');

    if (possibleHints.length === 0) {
        console.log("No new hint types available for this landmark (or data missing).");
        return;
    }

    const selectedCategory = possibleHints[Math.floor(Math.random() * possibleHints.length)];
    let hintText = '';
    let hintImageUrl: string | undefined = undefined;

    switch (selectedCategory) {
        case 'flag':
            hintText = `This is the flag of the country.`;
            hintImageUrl = `https://flagsapi.com/${currentLandmark.countryCode}/flat/64.png`;
            break;
        case 'continent':
            hintText = `This landmark is in a country on the continent of ${currentLandmark.continent}.`;
            break;
        case 'neighbors':
            const neighbors = currentLandmark.neighbors || [];
            if (neighbors.length > 0) {
                const neighborsToShow = neighbors.slice(0, 2).join(', ');
                hintText = `This country borders ${neighborsToShow}${neighbors.length > 2 ? ' and others' : ''}.`;
            } else {
                hintText = `This country is an island nation or has no direct land neighbors listed.`;
            }
            break;
        case 'language':
            const languages = currentLandmark.languages || [];
            if (languages.length > 0) {
                const languagesToShow = languages.join(', ');
                hintText = `A primary language spoken here is ${languagesToShow}.`;
            } else {
                 hintText = `Language information is not available for this hint.`;
            }
            break;
    }

    setActiveHint({ category: selectedCategory, text: hintText, imageUrl: hintImageUrl });
    setAvailableHints(prev => prev - 1);
    setShownHintsForCurrentQuestion(prev => [...prev, selectedCategory]);
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
    setAvailableHints(INITIAL_HINTS_PER_LEVEL);
    setActiveHint(null);
    setShownHintsForCurrentQuestion([]);
  };

  useEffect(() => {
    if (currentQuestionIndex >= shuffledGameData.length && !gameOver && !levelComplete) {
        setGameOver(true);
    }
  }, [currentQuestionIndex, shuffledGameData.length, gameOver, levelComplete]);

  if (gameOver) {
    const completedLevelIndex = currentLevel;
    const completedLevelName = LEVEL_CONFIG[completedLevelIndex]?.name || `Level ${completedLevelIndex + 1}`;
    return (
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 animate-fade-in">
        <div className="p-12 text-center bg-gradient-to-b from-blue-50 to-white">
          <div className="mb-8 flex justify-center">
            <Trophy size={80} className="text-yellow-500 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Game Over!</h1>
          <p className="text-2xl text-gray-600 mb-8">
            You completed {completedLevelName} and scored <span className="font-bold text-blue-600">{score}</span> total points!
          </p>
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

   if (!currentLandmark && !gameOver && !levelComplete) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-12 text-center">
        <h1 className="text-3xl font-bold text-gray-700">Loading game or no more landmarks available...</h1>
        <p className="mt-4 text-gray-600">If the game doesn't start, please check the data or refresh.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 flex flex-col">
      <div className="flex-grow relative w-full overflow-hidden rounded-t-2xl">
         <Map
          onCountryClick={handleCountryClick}
          revealedCountries={revealedCountries}
          correctCountry={currentLandmark?.country || ''}
         />
      </div>

      <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {currentLandmark && (
             <Landmark
                landmark={currentLandmark}
                feedback={feedback}
                activeHint={activeHint}
             />
        )}

        <div className="flex flex-col space-y-6">
          <ScoreBoard
            score={score}
            currentQuestion={currentQuestionNumberInLevel}
            totalQuestions={totalQuestionsInCurrentLevel}
            level={currentLevel + 1}
            availableHints={availableHints}
          />
          {currentLandmark && (
            <button
              onClick={handleHintRequest}
              disabled={
                availableHints <= 0 || 
                !!activeHint || 
                !currentLandmark ||
                ( 
                    (!currentLandmark.countryCode || shownHintsForCurrentQuestion.includes('flag')) &&
                    (!currentLandmark.continent || shownHintsForCurrentQuestion.includes('continent')) &&
                    ((!currentLandmark.neighbors || currentLandmark.neighbors.length === 0) || shownHintsForCurrentQuestion.includes('neighbors')) &&
                    ((!currentLandmark.languages || currentLandmark.languages.length === 0) || shownHintsForCurrentQuestion.includes('language'))
                )
              }
              className="w-full flex items-center justify-center px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200 disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed"
            >
              <HelpCircle size={20} className="mr-2" />
              Get a Hint ({availableHints} left)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
