import { describe, expect, it } from "vitest";
import { moods, conditions, temperatureBands } from "../src/config/constants.js";
import { getRecommendations } from "../src/services/recommendations.js";
import { getTemperatureBand, normalizeWeatherCode } from "../src/services/weather.js";
import { createTestDb } from "./helpers.js";

describe("weather utilities", () => {
  it("derives the correct temperature bands", () => {
    expect(getTemperatureBand(-3)).toBe("freezing");
    expect(getTemperatureBand(6)).toBe("cold");
    expect(getTemperatureBand(15)).toBe("mild");
    expect(getTemperatureBand(22)).toBe("warm");
    expect(getTemperatureBand(30)).toBe("hot");
  });

  it("normalizes raw weather codes into app conditions", () => {
    expect(normalizeWeatherCode(63)).toBe("rain");
    expect(normalizeWeatherCode(75)).toBe("snow");
    expect(normalizeWeatherCode(2)).toBe("cloudy");
    expect(normalizeWeatherCode(0)).toBe("sunny");
    expect(normalizeWeatherCode(0, 14)).toBe("wind");
  });
});

describe("seed coverage", () => {
  it("returns at least three recommendations for every supported combination", async () => {
    const db = await createTestDb();

    for (const mood of moods) {
      for (const condition of conditions) {
        for (const tempBand of temperatureBands) {
          const suggestions = await getRecommendations(db, mood, {
            source: "manual",
            temperatureC: 12,
            condition,
            tempBand,
            summary: "12°C"
          });

          expect(suggestions.length).toBeGreaterThanOrEqual(3);
          suggestions.forEach((suggestion) => {
            expect(suggestion.items.length).toBeGreaterThanOrEqual(3);
            expect(suggestion.paletteColors.length).toBeGreaterThanOrEqual(3);
            expect(suggestion.practicalNote.length).toBeGreaterThan(10);
          });
        }
      }
    }
  });
});
