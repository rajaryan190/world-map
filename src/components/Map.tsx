import React, { useState, useEffect, useRef } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { CountryFeature } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Search, X } from 'lucide-react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, D3ZoomEvent } from 'd3-zoom';
import { getCountryCentroid } from '../utils/helpers'; // Added

interface MapProps {
  onCountryClick: (countryName: string, clickedCountryCentroid: [number, number] | null) => void; // Modified
  revealedCountries: string[];
  correctCountry: string;
}

const WORLD_TOPOJSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export const Map: React.FC<MapProps> = ({
  onCountryClick,
  revealedCountries,
  correctCountry
}) => {
  const [worldData, setWorldData] = useState<CountryFeature[] | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ReturnType<typeof zoom<SVGSVGElement, unknown>> | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchedCountryFeature, setSearchedCountryFeature] = useState<CountryFeature | null>(null);

  useEffect(() => {
    fetch(WORLD_TOPOJSON_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(topology => {
        if (!topology.objects || !topology.objects.countries) {
           console.error("TopoJSON does not contain 'countries' object.");
           setWorldData([]);
           return;
        }
        const countries = feature(topology, topology.objects.countries);
        setWorldData(countries.features as CountryFeature[]);
      })
      .catch(error => {
        console.error("Error loading world map data:", error);
        setWorldData([]);
      });
  }, []);

  const width = 800;
  const height = 400;
  const initialProjectionScale = 120;

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !worldData) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);

    const zoomed = (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
      const { transform } = event;
      g.attr('transform', transform.toString());
      g.selectAll<SVGPathElement, CountryFeature>('path')
       .attr('stroke-width', 0.5 / transform.k);
    };

    const d3ZoomInstance = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 10])
      .on('zoom', zoomed);

    svg.call(d3ZoomInstance);
    zoomBehaviorRef.current = d3ZoomInstance;
    svg.call(d3ZoomInstance.transform, zoomIdentity);

    return () => {
      svg.on('.zoom', null);
    };
  }, [worldData]);

  const projection = geoMercator()
    .scale(initialProjectionScale)
    .translate([width / 2, height / 1.5]);

  const pathGenerator = geoPath().projection(projection);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current)
        .transition()
        .duration(250)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current)
        .transition()
        .duration(250)
        .call(zoomBehaviorRef.current.scaleBy, 1 / 1.3);
    }
  };
  
  const handleReset = () => {
    setSearchTerm('');
    setSearchedCountryFeature(null);
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomBehaviorRef.current.transform, zoomIdentity);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setSearchedCountryFeature(null);
      return;
    }

    if (worldData) {
      const found = worldData.find(
        (country) => country.properties.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchedCountryFeature(found || null);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchedCountryFeature(null);
  };

  if (!worldData) {
     return (
      <div className="relative w-full h-[400px] md:h-[500px] rounded-t-2xl overflow-hidden bg-gradient-to-b from-blue-50 to-white shadow-lg flex items-center justify-center text-gray-600">
         Loading map...
      </div>
     );
  }

  if (worldData.length === 0) {
     return (
      <div className="relative w-full h-[400px] md:h-[500px] rounded-t-2xl overflow-hidden bg-gradient-to-b from-blue-50 to-white shadow-lg flex items-center justify-center text-red-600">
         Error loading map data.
      </div>
     );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute top-0 left-0 right-0 p-4 z-10 space-y-3">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-800 drop-shadow">
            Click on the correct country
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              title="Zoom in" aria-label="Zoom in"
            >
              <ZoomIn size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              title="Zoom out" aria-label="Zoom out"
            >
              <ZoomOut size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              title="Reset view" aria-label="Reset view"
            >
              <Maximize2 size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for a country..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-auto md:max-w-xs p-2 pl-10 pr-8 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            aria-label="Search for a country"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full h-full overflow-hidden pt-28">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <g ref={gRef}>
            {worldData.map((country) => {
              const countryName = country.properties.name;
              const isRevealed = revealedCountries.includes(countryName);
              const isHovered = hoveredCountry === countryName;
              const isSearched = searchedCountryFeature?.properties.name === countryName;

              let fill = '#e5e7eb';
              if (isRevealed) {
                fill = '#22c55e';
              } else if (isSearched) {
                fill = '#f59e0b';
              } else if (isHovered) {
                fill = '#60a5fa';
              }

              return (
                <path
                  key={country.properties.name}
                  d={pathGenerator(country) || ''}
                  fill={fill}
                  stroke="#fff"
                  className="transition-colors duration-200 hover:opacity-80"
                  onClick={() => {
                    const centroid = getCountryCentroid(country); // Calculate centroid
                    onCountryClick(countryName, centroid); // Pass name and centroid
                    clearSearch();
                  }}
                  onMouseEnter={() => setHoveredCountry(countryName)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  aria-label={countryName}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hovered Country Tooltip */}
      {hoveredCountry &&
       searchedCountryFeature?.properties.name !== hoveredCountry &&
        (
        <div className="absolute bottom-6 left-6 bg-black bg-opacity-75 text-white text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-sm z-20">
          {hoveredCountry}
        </div>
      )}

       {/* Searched Country Name (Optional display) */}
       {searchedCountryFeature && (
         <div className="absolute bottom-6 right-6 bg-amber-500 text-white text-sm px-4 py-2 rounded-full shadow-lg z-20">
           Found: {searchedCountryFeature.properties.name}
         </div>
       )}
    </div>
  );
};
