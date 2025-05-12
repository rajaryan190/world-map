export interface LandmarkData {
  id: number;
  landmark: string;
  country: string;
  imageUrl: string;
  hint: string;
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
    coordinates: number[][][];
  };
}