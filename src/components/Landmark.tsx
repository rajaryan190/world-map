import React from 'react';
import { LandmarkData } from '../types';
import { ActiveHint } from './Game'; // Import ActiveHint type
import { MapPin, Flag, Globe2, Languages, MapPinned as NeighborsIcon } from 'lucide-react';

interface LandmarkProps {
  landmark: LandmarkData;
  feedback: { status: 'correct' | 'incorrect' | null, message: string };
  activeHint: ActiveHint | null;
}

const HintIconDisplay: React.FC<{ category: ActiveHint['category'] }> = ({ category }) => {
    switch (category) {
        case 'flag': return <Flag size={18} className="mr-2 text-blue-600 shrink-0" />;
        case 'continent': return <Globe2 size={18} className="mr-2 text-green-600 shrink-0" />;
        case 'neighbors': return <NeighborsIcon size={18} className="mr-2 text-purple-600 shrink-0" />;
        case 'language': return <Languages size={18} className="mr-2 text-red-600 shrink-0" />;
        default: return null;
    }
};

export const Landmark: React.FC<LandmarkProps> = ({ landmark, feedback, activeHint }) => {
  let feedbackClasses = '';
  if (feedback.status === 'correct') {
    feedbackClasses = 'bg-green-100 border-green-500 text-green-700';
  } else if (feedback.status === 'incorrect') {
    feedbackClasses = 'bg-red-100 border-red-500 text-red-700';
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="relative overflow-hidden rounded-lg h-[200px] md:h-[300px] bg-gray-100">
        <img
          src={landmark.imageUrl}
          alt={`Landmark: ${landmark.landmark}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center text-white">
            <MapPin size={20} className="mr-2" />
            <h3 className="text-lg font-semibold">{landmark.landmark}</h3>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex-grow flex flex-col"> {/* flex-grow and flex-col */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Which country is this landmark in?</h3>
        
        <div className="flex-grow"> {/* This div will take up remaining space for hint/feedback */}
            {activeHint && (
              <div className="mt-3 p-3 border border-blue-400 bg-blue-50 rounded-lg transition-all duration-300 animate-fade-in">
                <div className="flex items-start mb-1"> {/* items-start for multiline text */}
                    <HintIconDisplay category={activeHint.category} />
                    <strong className="text-blue-700">Hint: {activeHint.category.charAt(0).toUpperCase() + activeHint.category.slice(1)}</strong>
                </div>
                {activeHint.imageUrl && (
                  <img 
                    src={activeHint.imageUrl} 
                    alt={`${activeHint.category} hint`} 
                    className="my-2 h-12 border border-gray-300" 
                    onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if flag image fails
                  />
                )}
                <p className="text-sm text-gray-700 pl-7"> {/* Indent text to align with title if icon present */}
                  {activeHint.text}
                </p>
              </div>
            )}

            {feedback.message && !activeHint && (
              <div className={`mt-4 p-3 border rounded-lg ${feedbackClasses} transition-all duration-300 animate-fade-in`}>
                {feedback.message}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};