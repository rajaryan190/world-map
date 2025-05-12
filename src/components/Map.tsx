import React, { useState, useEffect, useRef } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { CountryFeature } from '../types';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MapProps {
  onCountryClick: (country: string) => void;
  revealedCountries: string[];
  correctCountry: string; // Keep this for potential future feedback on incorrect guesses
}

const WORLD_TOPOJSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export const Map: React.FC<MapProps> = ({
  onCountryClick,
  revealedCountries,
  correctCountry
}) => {
  const [worldData, setWorldData] = useState<CountryFeature[] | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [scale, setScale] = useState(120);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch(WORLD_TOPOJSON_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(topology => {
        // The 'countries' object name depends on the topojson file. 110m has 'countries'.
        if (!topology.objects || !topology.objects.countries) {
           console.error("TopoJSON does not contain 'countries' object.");
           setWorldData([]); // Set to empty to show map area but no countries
           return;
        }
        const countries = feature(topology, topology.objects.countries);
        setWorldData(countries.features as CountryFeature[]);
      })
      .catch(error => {
        console.error("Error loading world map data:", error);
        setWorldData([]); // Handle error by showing empty map area
      });
  }, []);

  const width = 800;
  const height = 400; // Keep this intrinsic SVG aspect ratio

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.3, 800)); // Increased zoom factor and max scale
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.3, 80)); // Adjusted zoom factor and min scale
  };

  const handleReset = () => {
    setScale(120); // Reset scale
  };

  // Use the full available width/height of the container for the projection
  // Adjust translate slightly if needed for centering
  const projection = geoMercator()
    .scale(scale)
    .translate([width / 2, height / 1.5]); // Adjusted vertical centering slightly


  const path = geoPath().projection(projection);

  // Add loading state visual
  if (!worldData && worldData !== []) {
     return (
  
      <div className="relative w-full h-[400px] md:h-[500px] rounded-t-2xl overflow-hidden bg-gradient-to-b from-blue-50 to-white shadow-lg flex items-center justify-center text-gray-600">
         Loading map...
      </div>
     );
  }

  // Add error state visual
  if (worldData && worldData.length === 0) {
     return (
      // Use classes to match the desired container look
      <div className="relative w-full h-[400px] md:h-[500px] rounded-t-2xl overflow-hidden bg-gradient-to-b from-blue-50 to-white shadow-lg flex items-center justify-center text-red-600">
         Error loading map data.
      </div>
     );
  }


  return (
    // Main Map container - ensure it takes up the required height and has rounded corners
    // This div gets its rounded-t-2xl from the parent in Game.tsx
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Controls and Title */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center"> {/* Added z-10 to ensure controls are above map paths */}
          <h2 className="text-xl font-semibold text-gray-800 drop-shadow">Click on the correct country</h2> {/* Added drop-shadow for readability */}
          <div className="flex gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              title="Zoom in"
              aria-label="Zoom in" // Added for accessibility
            >
              <ZoomIn size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              title="Zoom out"
              aria-label="Zoom out" // Added for accessibility
            >
              <ZoomOut size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              title="Reset zoom"
              aria-label="Reset zoom" // Added for accessibility
            >
              <Maximize2 size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

      {/* SVG Container */}
      {/* This inner div holds the SVG and ensures it fits within the outer container */}
      <div className="relative w-full h-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full" // SVG itself should fill its container
        >
          {worldData.map((country, i) => {
            const isRevealed = revealedCountries.includes(country.properties.name);
            const isHovered = hoveredCountry === country.properties.name;
            // Optional: Add a class for the correct country when feedback is 'incorrect'
            // const isCorrectCountryOnIncorrectGuess = feedback.status === 'incorrect' && country.properties.name === correctCountry;

            let fill = '#e5e7eb'; // default gray
            if (isRevealed) {
                fill = '#22c55e'; // green for revealed
            } else if (isHovered) {
                 fill = '#60a5fa'; // blue for hovered
            }
            // if (isCorrectCountryOnIncorrectGuess) {
            //     fill = '#f97316'; // orange, for example
            // }


            return (
              <path
                key={i}
                d={path(country) || ''}
                fill={fill} // Use the calculated fill color
                stroke="#fff"
                strokeWidth="0.5"
                className="transition-colors duration-200 cursor-pointer hover:opacity-80"
                onClick={() => onCountryClick(country.properties.name)}
                onMouseEnter={() => setHoveredCountry(country.properties.name)}
                onMouseLeave={() => setHoveredCountry(null)}
                aria-label={country.properties.name} // Added for accessibility
              />
            );
          })}
        </svg>
      </div>

      {/* Hovered Country Tooltip */}
      {hoveredCountry && !revealedCountries.includes(hoveredCountry) && ( // Only show if not revealed yet
        <div className="absolute bottom-6 left-6 bg-black bg-opacity-75 text-white text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-sm z-20"> {/* Added z-20 to be above controls */}
          {hoveredCountry}
        </div>
      )}
    </div>
  );
};