import React from 'react';
import { LandmarkData } from '../types';
import { MapPin } from 'lucide-react';

interface LandmarkProps {
  landmark: LandmarkData;
  feedback: { status: 'correct' | 'incorrect' | null, message: string };
}

export const Landmark: React.FC<LandmarkProps> = ({ landmark, feedback }) => {
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
          alt={`Landmark`}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center text-white">
            <MapPin size={20} className="mr-2" />
            <h3 className="text-lg font-semibold">{landmark.landmark}</h3>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Which country is this landmark in?</h3>
        
        {feedback.message && (
          <div className={`mt-4 p-3 border rounded-lg ${feedbackClasses} transition-all duration-300`}>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};