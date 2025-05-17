
import { geoCentroid } from 'd3-geo';
import { CountryFeature } from '../types';

/**
 * Shuffle an array using the Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// --- New Helper Functions for Distance and Direction ---

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function rad2deg(rad: number): number {
  return rad * (180 / Math.PI);
}

/**
 * Calculates the distance between two lat/lon points using the Haversine formula.
 * @returns Distance in kilometers, rounded.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance);
}

/**
 * Calculates the initial bearing from point 1 to point 2.
 * @returns Bearing in degrees (0-360).
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = deg2rad(lat1);
  const φ2 = deg2rad(lat2);
  const λ1 = deg2rad(lon1);
  const λ2 = deg2rad(lon2);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);
  const brng = (rad2deg(θ) + 360) % 360; // normalize to 0-360
  return brng;
}

/**
 * Converts a bearing angle (in degrees) to a cardinal/intercardinal direction string.
 * (e.g., "North", "North-East")
 */
export function getDirection(bearing: number): string {
  const directions = [
    'North', 'North-East', 'East', 'South-East',
    'South', 'South-West', 'West', 'North-West'
  ];
  // Each slice is 360/8 = 45 degrees.
  // Add 22.5 (45/2) to center the slices around the directions.
  // e.g. North is 337.5 (-22.5) to 22.5 degrees.
  const index = Math.floor((bearing + 22.5) / 45) % 8;
  return directions[index];
}

/**
 * Calculates the centroid of a GeoJSON feature.
 * @returns [longitude, latitude] or null if calculation fails or feature is invalid.
 */
export function getCountryCentroid(feature: CountryFeature): [number, number] | null {
    if (feature && feature.geometry) {
        // d3-geo's geoCentroid expects a GeoJSON Feature object.
        // Our CountryFeature type should be compatible.
        const centroid = geoCentroid(feature as any); // Use 'as any' if type compatibility issues arise, though CountryFeature should align.
        // Ensure centroid is valid numbers
        if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
            return centroid; // Returns [longitude, latitude]
        }
    }
    console.warn("Could not calculate centroid for feature:", feature);
    return null;
}