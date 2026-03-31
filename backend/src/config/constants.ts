export const moods = [
  "happy",
  "casual",
  "professional",
  "sporty",
  "cozy",
  "confident"
] as const;

export const conditions = [
  "sunny",
  "cloudy",
  "rain",
  "snow",
  "wind"
] as const;

export const temperatureBands = [
  "freezing",
  "cold",
  "mild",
  "warm",
  "hot"
] as const;

export type Mood = (typeof moods)[number];
export type Condition = (typeof conditions)[number];
export type TemperatureBand = (typeof temperatureBands)[number];

export const moodLabels: Record<Mood, string> = {
  happy: "Happy",
  casual: "Casual",
  professional: "Professional",
  sporty: "Sporty",
  cozy: "Cozy",
  confident: "Confident"
};

export const conditionLabels: Record<Condition, string> = {
  sunny: "sunny",
  cloudy: "cloudy",
  rain: "rainy",
  snow: "snowy",
  wind: "windy"
};

export const paletteByMood: Record<Mood, string[]> = {
  happy: ["marigold", "sky blue", "cream"],
  casual: ["denim", "olive", "stone"],
  professional: ["navy", "charcoal", "white"],
  sporty: ["cobalt", "graphite", "mint"],
  cozy: ["camel", "plum", "oatmeal"],
  confident: ["black", "ruby", "sand"]
};
