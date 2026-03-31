import { getEnv } from "../config/env.js";
import { createDatabase, createPool } from "./client.js";
import { buildSeedCatalog } from "./seed-data.js";
import {
  clothingItems,
  moodWeatherOutfits,
  outfitTemplateItems,
  outfitTemplates
} from "./schema.js";

async function main() {
  const env = getEnv();
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  const pool = createPool(env.databaseUrl);
  const db = createDatabase(pool);
  const existing = await db.select().from(outfitTemplates).limit(1);

  if (existing.length > 0) {
    console.log("Seed data already present. Skipping.");
    await pool.end();
    return;
  }

  const catalog = buildSeedCatalog();
  await db.insert(clothingItems).values(catalog.clothingItems);
  await db.insert(outfitTemplates).values(catalog.outfitTemplates);
  await db.insert(outfitTemplateItems).values(catalog.outfitTemplateItems);
  await db.insert(moodWeatherOutfits).values(catalog.moodWeatherOutfits);

  console.log(`Seed complete. Inserted ${catalog.outfitTemplates.length} outfit templates.`);
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
