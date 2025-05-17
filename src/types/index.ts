
export interface LandmarkData {
  id: number;
  landmark: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2 code (e.g., "FR", "US")
  imageUrl: string;
  // hint?: string; // Deprecated or use as a general fallback if new hint types are missing

  // New Hint Fields
  continent?: string;
  neighbors?: string[]; // Array of neighboring country names
  languages?: string[]; // Array of primary languages

  // Coordinates for distance/direction hint
  latitude?: number;
  longitude?: number;
}

export interface CountryData {
  id: number;
  name: string;
  position: {
    x: number;
    y: number;
  };
  size: number;
}

export interface CountryFeature {
  type: string;
  properties: {
    name: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][]; // Or any for more complex geometries
  };
}
