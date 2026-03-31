import { randomUUID } from "node:crypto";
import {
  conditions,
  conditionLabels,
  moods,
  moodLabels,
  paletteByMood,
  temperatureBands,
  type Condition,
  type Mood,
  type TemperatureBand
} from "../config/constants.js";

type ClothingSeed = {
  id: string;
  category: string;
  itemName: string;
  defaultColor: string;
  warmthLevel: number;
  waterproof: boolean;
  styleTags: string[];
};

type OutfitTemplateSeed = {
  id: string;
  title: string;
  paletteName: string;
  paletteColors: string[];
  practicalNote: string;
  active: boolean;
};

type OutfitTemplateItemSeed = {
  id: string;
  outfitTemplateId: string;
  clothingItemId: string;
  layerOrder: number;
  colorOverride: string | null;
};

type MoodWeatherMappingSeed = {
  id: string;
  mood: Mood;
  condition: Condition;
  tempBand: TemperatureBand;
  outfitTemplateId: string;
  priority: number;
};

export type SeedCatalog = {
  clothingItems: ClothingSeed[];
  outfitTemplates: OutfitTemplateSeed[];
  outfitTemplateItems: OutfitTemplateItemSeed[];
  moodWeatherOutfits: MoodWeatherMappingSeed[];
};

type ItemDescriptor = {
  category: string;
  itemName: string;
  color: string;
  warmthLevel: number;
  waterproof: boolean;
  styleTags: string[];
};

const moodTopOptions: Record<Mood, string[]> = {
  happy: ["sunlit knit top", "bright relaxed shirt", "soft joy tee"],
  casual: ["easy striped tee", "weekend henley", "relaxed overshirt"],
  professional: ["crisp button-down", "structured blouse", "sleek knit polo"],
  sporty: ["performance zip top", "breathable training tee", "lightweight quarter-zip"],
  cozy: ["soft brushed sweater", "chunky knit pullover", "warm waffle top"],
  confident: ["sharp fitted tee", "clean mock neck", "bold silk-touch shirt"]
};

const moodBottomOptions: Record<Mood, string[]> = {
  happy: ["tailored ankle trousers", "flowy midi skirt", "soft straight jeans"],
  casual: ["relaxed jeans", "utility chinos", "easy drawstring pants"],
  professional: ["pressed trousers", "structured midi skirt", "sleek straight-leg pants"],
  sporty: ["tech joggers", "streamlined leggings", "performance shorts"],
  cozy: ["ribbed lounge pants", "soft cord trousers", "comfort knit skirt"],
  confident: ["sharp black trousers", "sleek midi skirt", "structured wide-leg pants"]
};

const moodLayerOptions: Record<Mood, string[]> = {
  happy: ["cropped cardigan", "soft blazer", "light denim jacket"],
  casual: ["overshirt jacket", "cotton hoodie", "utility jacket"],
  professional: ["tailored blazer", "fine knit cardigan", "polished trench"],
  sporty: ["track jacket", "light shell layer", "performance hoodie"],
  cozy: ["long cardigan", "fleece zip-up", "soft sherpa layer"],
  confident: ["sharp blazer", "sleek leather-look layer", "minimal longline coat"]
};

const moodAccessoryOptions: Record<Mood, string[]> = {
  happy: ["sunny tote", "bright scarf", "playful cap"],
  casual: ["canvas tote", "everyday cap", "soft scarf"],
  professional: ["structured bag", "silk scarf", "sleek belt"],
  sporty: ["training cap", "crossbody sling", "performance socks"],
  cozy: ["chunky scarf", "soft beanie", "warm tote"],
  confident: ["statement belt", "structured tote", "clean sunglasses"]
};

const tempOuterwear: Record<TemperatureBand, string | null> = {
  freezing: "insulated coat",
  cold: "weather-ready jacket",
  mild: "light transitional jacket",
  warm: "breezy overshirt",
  hot: null
};

const tempFootwear: Record<TemperatureBand, string[]> = {
  freezing: ["insulated boots", "lined leather boots", "weatherproof trainers"],
  cold: ["ankle boots", "leather sneakers", "weather-ready trainers"],
  mild: ["clean sneakers", "loafer-inspired shoes", "low boots"],
  warm: ["canvas sneakers", "easy loafers", "sport sandals"],
  hot: ["breathable sneakers", "sleek sandals", "light slip-ons"]
};

const paletteNames = ["Glow", "Balance", "Shift"];

function rotatePalette(colors: string[], offset: number) {
  return colors.map((_, index) => colors[(index + offset) % colors.length]);
}

function getWarmthLevel(tempBand: TemperatureBand, category: string) {
  const base = {
    freezing: 5,
    cold: 4,
    mild: 3,
    warm: 2,
    hot: 1
  }[tempBand];

  if (category === "outerwear") {
    return Math.min(base + 1, 5);
  }

  if (category === "accessory") {
    return tempBand === "hot" ? 1 : Math.max(base - 1, 1);
  }

  return base;
}

function buildTitle(mood: Mood, condition: Condition, tempBand: TemperatureBand, variant: number) {
  const titleVariants = ["Everyday Set", "Easy Layers", "Ready-to-Go Look"];
  return `${moodLabels[mood]} ${conditionLabels[condition]} ${titleVariants[variant - 1]} (${tempBand})`;
}

function buildPracticalNote(
  mood: Mood,
  condition: Condition,
  tempBand: TemperatureBand,
  variant: number
) {
  const tempNotes: Record<TemperatureBand, string> = {
    freezing: "Layered to keep you comfortable in biting cold.",
    cold: "Warm enough for a chilly day without feeling bulky.",
    mild: "Balanced for in-between temperatures.",
    warm: "Light enough to stay comfortable through a warmer stretch.",
    hot: "Breathable and easy for heat and bright sun."
  };
  const toneNotes = [
    `It keeps a ${mood} feel without sacrificing comfort.`,
    `It stays polished while matching your ${mood} mood.`,
    "It feels practical, confident, and easy to wear."
  ];

  return `${tempNotes[tempBand]} Perfect for ${conditionLabels[condition]} conditions. ${toneNotes[variant - 1]}`;
}

function buildOutfitItems(
  mood: Mood,
  condition: Condition,
  tempBand: TemperatureBand,
  variant: number,
  paletteColors: string[]
): ItemDescriptor[] {
  const items: ItemDescriptor[] = [
    {
      category: "top",
      itemName: moodTopOptions[mood][variant - 1],
      color: paletteColors[0],
      warmthLevel: getWarmthLevel(tempBand, "top"),
      waterproof: false,
      styleTags: [mood, tempBand]
    },
    {
      category: "bottom",
      itemName: moodBottomOptions[mood][variant - 1],
      color: paletteColors[1] || paletteColors[0],
      warmthLevel: getWarmthLevel(tempBand, "bottom"),
      waterproof: false,
      styleTags: [mood, condition]
    }
  ];

  if (tempBand !== "hot" || condition === "wind") {
    items.push({
      category: "layer",
      itemName: moodLayerOptions[mood][variant - 1],
      color: paletteColors[2] || paletteColors[0],
      warmthLevel: getWarmthLevel(tempBand, "layer"),
      waterproof: false,
      styleTags: [mood, "layered"]
    });
  }

  if (tempOuterwear[tempBand] || condition === "rain" || condition === "snow" || condition === "wind") {
    items.push({
      category: "outerwear",
      itemName: tempOuterwear[tempBand] ?? "light shell layer",
      color: paletteColors[1] || paletteColors[0],
      warmthLevel: getWarmthLevel(tempBand, "outerwear"),
      waterproof: condition === "rain" || condition === "snow",
      styleTags: [condition, tempBand]
    });
  }

  items.push({
    category: "footwear",
    itemName: tempFootwear[tempBand][variant - 1],
    color: paletteColors[0],
    warmthLevel: getWarmthLevel(tempBand, "footwear"),
    waterproof: condition === "rain" || condition === "snow",
    styleTags: [condition, "footwear"]
  });

  items.push({
    category: "accessory",
    itemName:
      condition === "rain"
        ? "compact umbrella"
        : condition === "snow"
          ? "warm beanie"
          : condition === "wind"
            ? "wind-ready scarf"
            : moodAccessoryOptions[mood][variant - 1],
    color: paletteColors[2] || paletteColors[1] || paletteColors[0],
    warmthLevel: getWarmthLevel(tempBand, "accessory"),
    waterproof: false,
    styleTags: [condition, mood]
  });

  return items;
}

export function buildSeedCatalog(): SeedCatalog {
  const clothingMap = new Map<string, ClothingSeed>();
  const outfitTemplates: OutfitTemplateSeed[] = [];
  const outfitTemplateItems: OutfitTemplateItemSeed[] = [];
  const moodWeatherMappings: MoodWeatherMappingSeed[] = [];

  for (const mood of moods) {
    for (const condition of conditions) {
      for (const tempBand of temperatureBands) {
        for (let variant = 1; variant <= 3; variant += 1) {
          const paletteColors = rotatePalette(paletteByMood[mood], variant - 1);
          const outfitTemplateId = randomUUID();

          outfitTemplates.push({
            id: outfitTemplateId,
            title: buildTitle(mood, condition, tempBand, variant),
            paletteName: `${moodLabels[mood]} ${paletteNames[variant - 1]}`,
            paletteColors,
            practicalNote: buildPracticalNote(mood, condition, tempBand, variant),
            active: true
          });

          const descriptors = buildOutfitItems(mood, condition, tempBand, variant, paletteColors);

          descriptors.forEach((item, index) => {
            const key = [
              item.category,
              item.itemName,
              item.color,
              item.warmthLevel,
              item.waterproof
            ].join("::");

            let clothingItem = clothingMap.get(key);
            if (!clothingItem) {
              clothingItem = {
                id: randomUUID(),
                category: item.category,
                itemName: item.itemName,
                defaultColor: item.color,
                warmthLevel: item.warmthLevel,
                waterproof: item.waterproof,
                styleTags: item.styleTags
              };
              clothingMap.set(key, clothingItem);
            }

            outfitTemplateItems.push({
              id: randomUUID(),
              outfitTemplateId,
              clothingItemId: clothingItem.id,
              layerOrder: index + 1,
              colorOverride: item.color
            });
          });

          moodWeatherMappings.push({
            id: randomUUID(),
            mood,
            condition,
            tempBand,
            outfitTemplateId,
            priority: variant
          });
        }
      }
    }
  }

  return {
    clothingItems: [...clothingMap.values()],
    outfitTemplates,
    outfitTemplateItems,
    moodWeatherOutfits: moodWeatherMappings
  };
}
