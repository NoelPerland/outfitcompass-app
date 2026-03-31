export const moods = [
  {
    value: "happy",
    label: "Happy",
    emoji: "😊",
    tagline: "Bright and easy",
    accent: "Yellow / Blue / Cream"
  },
  {
    value: "casual",
    label: "Casual",
    emoji: "🙂",
    tagline: "Relaxed and simple",
    accent: "Denim / Olive / Stone"
  },
  {
    value: "professional",
    label: "Professional",
    emoji: "🖤",
    tagline: "Clean and polished",
    accent: "Navy / Charcoal / White"
  },
  {
    value: "sporty",
    label: "Sporty",
    emoji: "🏃",
    tagline: "Active and fresh",
    accent: "Cobalt / Graphite / Mint"
  },
  {
    value: "cozy",
    label: "Cozy",
    emoji: "🧸",
    tagline: "Soft and warm",
    accent: "Camel / Plum / Oatmeal"
  },
  {
    value: "confident",
    label: "Confident",
    emoji: "✨",
    tagline: "Bold and sharp",
    accent: "Black / Ruby / Sand"
  }
] as const;

export const conditions = [
  { value: "sunny", label: "Sunny" },
  { value: "cloudy", label: "Cloudy" },
  { value: "rain", label: "Rain" },
  { value: "snow", label: "Snow" },
  { value: "wind", label: "Wind" }
] as const;

export const moodCopy = {
  happy: "Light, warm pieces.",
  casual: "Easy everyday combinations.",
  professional: "Sharp and ready.",
  sporty: "Light performance layers.",
  cozy: "Comfort-first pieces.",
  confident: "Clean bold contrast."
} as const;
