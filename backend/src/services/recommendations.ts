import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import {
  clothingItems,
  moodWeatherOutfits,
  outfitTemplateItems,
  outfitTemplates,
  savedOutfits,
  users
} from "../db/schema.js";
import type { Condition, Mood, TemperatureBand } from "../config/constants.js";
import { AppError } from "../utils/errors.js";
import type { ResolvedWeather } from "./weather.js";

export type RecommendationItem = {
  category: string;
  name: string;
  color: string;
};

export type SavePayload = {
  outfitTemplateId: string;
  mood: Mood;
  resolvedCondition: Condition;
  resolvedTempBand: TemperatureBand;
  resolvedTemperatureC: number;
  weatherSummary: string;
  title: string;
  practicalNote: string;
  paletteSnapshot: string[];
  itemsSnapshot: RecommendationItem[];
};

export type OutfitRecommendation = {
  id: string;
  templateId: string;
  title: string;
  paletteColors: string[];
  practicalNote: string;
  items: RecommendationItem[];
  savePayload: SavePayload;
};

export async function getRecommendations(
  db: AppDatabase,
  mood: Mood,
  resolvedWeather: ResolvedWeather
): Promise<OutfitRecommendation[]> {
  const rows = await db
    .select({
      templateId: outfitTemplates.id,
      title: outfitTemplates.title,
      paletteColors: outfitTemplates.paletteColors,
      practicalNote: outfitTemplates.practicalNote,
      category: clothingItems.category,
      itemName: clothingItems.itemName,
      defaultColor: clothingItems.defaultColor,
      colorOverride: outfitTemplateItems.colorOverride
    })
    .from(moodWeatherOutfits)
    .innerJoin(outfitTemplates, eq(moodWeatherOutfits.outfitTemplateId, outfitTemplates.id))
    .innerJoin(outfitTemplateItems, eq(outfitTemplateItems.outfitTemplateId, outfitTemplates.id))
    .innerJoin(clothingItems, eq(outfitTemplateItems.clothingItemId, clothingItems.id))
    .where(
      and(
        eq(moodWeatherOutfits.mood, mood),
        eq(moodWeatherOutfits.condition, resolvedWeather.condition),
        eq(moodWeatherOutfits.tempBand, resolvedWeather.tempBand),
        eq(outfitTemplates.active, true)
      )
    )
    .orderBy(asc(moodWeatherOutfits.priority), asc(outfitTemplateItems.layerOrder));

  if (rows.length === 0) {
    throw new AppError(404, "NO_RECOMMENDATIONS", "We could not find outfit ideas for that combination yet.");
  }

  const grouped = new Map<string, OutfitRecommendation>();

  for (const row of rows) {
    let recommendation = grouped.get(row.templateId);
    if (!recommendation) {
      recommendation = {
        id: row.templateId,
        templateId: row.templateId,
        title: row.title,
        paletteColors: row.paletteColors,
        practicalNote: row.practicalNote,
        items: [],
        savePayload: {
          outfitTemplateId: row.templateId,
          mood,
          resolvedCondition: resolvedWeather.condition,
          resolvedTempBand: resolvedWeather.tempBand,
          resolvedTemperatureC: resolvedWeather.temperatureC,
          weatherSummary: resolvedWeather.summary,
          title: row.title,
          practicalNote: row.practicalNote,
          paletteSnapshot: row.paletteColors,
          itemsSnapshot: []
        }
      };
      grouped.set(row.templateId, recommendation);
    }

    recommendation.items.push({
      category: row.category,
      name: row.itemName,
      color: row.colorOverride || row.defaultColor
    });
  }

  const suggestions = [...grouped.values()].slice(0, 5);
  suggestions.forEach((suggestion) => {
    suggestion.savePayload.itemsSnapshot = suggestion.items;
  });

  return suggestions;
}

export async function createUser(db: AppDatabase, email: string, passwordHash: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    throw new AppError(409, "EMAIL_IN_USE", "That email is already registered.", {
      email: "Email is already in use."
    });
  }

  const user = {
    id: randomUUID(),
    email: normalizedEmail,
    passwordHash
  };

  await db.insert(users).values(user);
  return { id: user.id, email: user.email };
}

export async function findUserByEmail(db: AppDatabase, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  return user;
}

export async function findUserById(db: AppDatabase, userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user;
}

export async function listSavedOutfits(db: AppDatabase, userId: string) {
  const records = await db
    .select()
    .from(savedOutfits)
    .where(eq(savedOutfits.userId, userId))
    .orderBy(asc(savedOutfits.createdAt));

  return records.reverse();
}

export async function saveOutfit(db: AppDatabase, userId: string, payload: SavePayload) {
  const record = {
    id: randomUUID(),
    userId,
    outfitTemplateId: payload.outfitTemplateId,
    mood: payload.mood,
    resolvedCondition: payload.resolvedCondition,
    resolvedTempBand: payload.resolvedTempBand,
    resolvedTemperatureC: payload.resolvedTemperatureC,
    weatherSummary: payload.weatherSummary,
    title: payload.title,
    practicalNote: payload.practicalNote,
    paletteSnapshot: payload.paletteSnapshot,
    itemsSnapshot: payload.itemsSnapshot
  };

  await db.insert(savedOutfits).values(record);
  return record;
}

export async function deleteSavedOutfit(db: AppDatabase, userId: string, outfitId: string) {
  const [existing] = await db
    .select()
    .from(savedOutfits)
    .where(and(eq(savedOutfits.id, outfitId), eq(savedOutfits.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "We could not find that saved outfit.");
  }

  await db.delete(savedOutfits).where(eq(savedOutfits.id, outfitId));
}
