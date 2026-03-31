import { describe, expect, it, vi } from "vitest";
import { createTestApp } from "./helpers.js";

describe("backend API", () => {
  it("returns recommendations for manual weather", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/recommendations",
      payload: {
        mood: "happy",
        weather: {
          source: "manual",
          temperatureC: 9,
          condition: "rain"
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().suggestions.length).toBeGreaterThanOrEqual(3);
    expect(response.json().weatherSummary.condition).toBe("rain");
    await app.close();
  });

  it("returns helpful validation errors", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/recommendations",
      payload: {
        mood: "happy",
        weather: {
          source: "manual",
          temperatureC: 500,
          condition: "storm"
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_INPUT");
    await app.close();
  });

  it("supports the geolocation weather flow", async () => {
    const app = await createTestApp();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 4,
            weather_code: 63,
            wind_speed_10m: 5
          }
        })
      })
    );

    const response = await app.inject({
      method: "POST",
      url: "/api/recommendations",
      payload: {
        mood: "cozy",
        weather: {
          source: "geo",
          latitude: 59.3293,
          longitude: 18.0686
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().weatherSummary.condition).toBe("rain");
    vi.unstubAllGlobals();
    await app.close();
  });

  it("registers, saves, lists, and deletes outfits", async () => {
    const app = await createTestApp();

    const register = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "tester@example.com",
        password: "strongpass123"
      }
    });

    expect(register.statusCode).toBe(200);
    const sessionCookie = register.cookies.find((cookie) => cookie.name === "session");
    expect(sessionCookie).toBeTruthy();

    const recommendationResponse = await app.inject({
      method: "POST",
      url: "/api/recommendations",
      payload: {
        mood: "professional",
        weather: {
          source: "manual",
          temperatureC: 18,
          condition: "cloudy"
        }
      }
    });

    const suggestion = recommendationResponse.json().suggestions[0];

    const save = await app.inject({
      method: "POST",
      url: "/api/saved-outfits",
      cookies: { session: sessionCookie?.value || "" },
      payload: suggestion.savePayload
    });

    expect(save.statusCode).toBe(200);

    const list = await app.inject({
      method: "GET",
      url: "/api/saved-outfits",
      cookies: { session: sessionCookie?.value || "" }
    });

    expect(list.statusCode).toBe(200);
    expect(list.json().savedOutfits).toHaveLength(1);

    const savedOutfitId = list.json().savedOutfits[0].id;
    const remove = await app.inject({
      method: "DELETE",
      url: `/api/saved-outfits/${savedOutfitId}`,
      cookies: { session: sessionCookie?.value || "" }
    });

    expect(remove.statusCode).toBe(200);
    await app.close();
  });

  it("rejects unauthenticated save requests", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/saved-outfits",
      payload: {
        outfitTemplateId: "template-id",
        mood: "happy",
        resolvedCondition: "sunny",
        resolvedTempBand: "warm",
        resolvedTemperatureC: 22,
        weatherSummary: "22°C and sunny",
        title: "Sample",
        practicalNote: "Easy for a bright day.",
        paletteSnapshot: ["cream", "blue", "gold"],
        itemsSnapshot: [{ category: "top", name: "tee", color: "cream" }]
      }
    });

    expect(response.statusCode).toBe(401);
    await app.close();
  });
});
