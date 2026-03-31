export type Mood = "happy" | "casual" | "professional" | "sporty" | "cozy" | "confident";
export type Condition = "sunny" | "cloudy" | "rain" | "snow" | "wind";
export type WeatherMode = "geo" | "manual";

export type RecommendationItem = {
  category: string;
  name: string;
  color: string;
};

export type SavePayload = {
  outfitTemplateId: string;
  mood: Mood;
  resolvedCondition: Condition;
  resolvedTempBand: string;
  resolvedTemperatureC: number;
  weatherSummary: string;
  title: string;
  practicalNote: string;
  paletteSnapshot: string[];
  itemsSnapshot: RecommendationItem[];
};

export type Suggestion = {
  id: string;
  templateId: string;
  title: string;
  paletteColors: string[];
  practicalNote: string;
  items: RecommendationItem[];
  savePayload: SavePayload;
};

export type WeatherSummary = {
  source: WeatherMode;
  temperatureC: number;
  condition: Condition;
  tempBand: string;
  summary: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

export type SavedOutfit = {
  id: string;
  outfitTemplateId?: string | null;
  mood: Mood;
  resolvedCondition: Condition;
  resolvedTempBand: string;
  resolvedTemperatureC: number;
  weatherSummary: string;
  title: string;
  practicalNote: string;
  paletteSnapshot: string[];
  itemsSnapshot: RecommendationItem[];
  createdAt: string;
};
