import { test, expect } from "@playwright/test";

const sampleSuggestion = {
  id: "template-1",
  templateId: "template-1",
  title: "Happy rainy Everyday Set (cold)",
  paletteColors: ["marigold", "sky blue", "cream"],
  practicalNote: "Warm enough for a chilly day without feeling bulky. Perfect for rainy conditions.",
  items: [
    { category: "top", name: "sunlit knit top", color: "marigold" },
    { category: "bottom", name: "tailored ankle trousers", color: "sky blue" },
    { category: "outerwear", name: "weather-ready jacket", color: "cream" }
  ],
  savePayload: {
    outfitTemplateId: "template-1",
    mood: "happy",
    resolvedCondition: "rain",
    resolvedTempBand: "cold",
    resolvedTemperatureC: 9,
    weatherSummary: "9°C and rain",
    title: "Happy rainy Everyday Set (cold)",
    practicalNote: "Warm enough for a chilly day without feeling bulky. Perfect for rainy conditions.",
    paletteSnapshot: ["marigold", "sky blue", "cream"],
    itemsSnapshot: [
      { category: "top", name: "sunlit knit top", color: "marigold" },
      { category: "bottom", name: "tailored ankle trousers", color: "sky blue" },
      { category: "outerwear", name: "weather-ready jacket", color: "cream" }
    ]
  }
};

test("shows outfit suggestions from geolocation", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success: (position: unknown) => void) =>
          success({
            coords: {
              latitude: 59.3293,
              longitude: 18.0686
            }
          })
      },
      configurable: true
    });
  });

  await page.route("http://localhost:3001/api/auth/me", async (route) => {
    await route.fulfill({ status: 401, body: JSON.stringify({ error: { message: "Unauthorized" } }) });
  });

  await page.route("http://localhost:3001/api/recommendations", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        weatherSummary: {
          source: "geo",
          temperatureC: 9,
          condition: "rain",
          tempBand: "cold",
          summary: "9°C and rain"
        },
        suggestions: [sampleSuggestion, { ...sampleSuggestion, id: "template-2", templateId: "template-2" }, { ...sampleSuggestion, id: "template-3", templateId: "template-3" }]
      })
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Use local weather" }).click();

  await expect(
    page.getByRole("heading", { name: "Happy rainy Everyday Set (cold)" }).first()
  ).toBeVisible();
  await expect(page.getByText("Built around 9°C and rain.")).toBeVisible();
});

test("falls back cleanly to manual weather entry when geolocation fails", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (_success: unknown, error: (failure: Error) => void) =>
          error(new Error("Permission denied"))
      },
      configurable: true
    });
  });

  await page.route("http://localhost:3001/api/auth/me", async (route) => {
    await route.fulfill({ status: 401, body: JSON.stringify({ error: { message: "Unauthorized" } }) });
  });

  await page.route("http://localhost:3001/api/recommendations", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        weatherSummary: {
          source: "manual",
          temperatureC: 18,
          condition: "cloudy",
          tempBand: "warm",
          summary: "18°C and cloudy"
        },
        suggestions: [sampleSuggestion]
      })
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Use local weather" }).click();
  await expect(page.getByText("Location did not work smoothly this time.")).toBeVisible();

  await page.getByRole("radio", { name: "Enter weather manually" }).click();
  await page.getByLabel("Temperature (°C)").fill("18");
  await page.getByLabel("Condition").selectOption("cloudy");
  await page.getByRole("button", { name: "Show outfit ideas" }).click();

  await expect(
    page.getByRole("heading", { name: "Happy rainy Everyday Set (cold)" }).first()
  ).toBeVisible();
});

test("logs in, saves an outfit, and keeps it after refresh", async ({ page }) => {
  let isAuthenticated = false;
  let savedOutfits = [] as Array<Record<string, unknown>>;

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success: (position: unknown) => void) =>
          success({
            coords: {
              latitude: 59.3293,
              longitude: 18.0686
            }
          })
      },
      configurable: true
    });
  });

  await page.route("http://localhost:3001/api/auth/me", async (route) => {
    if (isAuthenticated) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { id: "user-1", email: "tester@example.com" } })
      });
      return;
    }

    await route.fulfill({ status: 401, body: JSON.stringify({ error: { message: "Unauthorized" } }) });
  });

  await page.route("http://localhost:3001/api/auth/login", async (route) => {
    isAuthenticated = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: { id: "user-1", email: "tester@example.com" } })
    });
  });

  await page.route("http://localhost:3001/api/saved-outfits", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ savedOutfits })
      });
      return;
    }

    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() as Record<string, unknown>;
      const saved = {
        id: "saved-1",
        createdAt: new Date().toISOString(),
        ...payload
      };
      savedOutfits = [saved];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ savedOutfit: saved })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true })
    });
  });

  await page.route("http://localhost:3001/api/recommendations", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        weatherSummary: {
          source: "geo",
          temperatureC: 9,
          condition: "rain",
          tempBand: "cold",
          summary: "9°C and rain"
        },
        suggestions: [sampleSuggestion]
      })
    });
  });

  await page.goto("/");
  await page.getByLabel("Email").fill("tester@example.com");
  await page.getByLabel("Password").fill("strongpass123");
  await page.locator(".auth-card .primary-button").click();
  await expect(page.getByText("Signed in as tester@example.com.")).toBeVisible();

  await page.getByRole("button", { name: "Use local weather" }).click();
  await page.getByRole("button", { name: "Save this outfit" }).click();

  await expect(page.getByText("Saved. That outfit will be waiting for you later.")).toBeVisible();
  await expect(page.getByText("Happy rainy Everyday Set (cold)")).toHaveCount(2);

  await page.reload();
  await expect(page.getByText("Happy rainy Everyday Set (cold)")).toBeVisible();
});
