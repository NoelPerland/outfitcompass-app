import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { FastifyInstance } from "fastify";
import * as schema from "../src/db/schema.js";
import { buildApp } from "../src/app.js";
import type { AppDatabase } from "../src/db/client.js";
import { initSql } from "../src/db/init-sql.js";
import { buildSeedCatalog } from "../src/db/seed-data.js";
import {
  clothingItems,
  moodWeatherOutfits,
  outfitTemplateItems,
  outfitTemplates
} from "../src/db/schema.js";

export async function createTestDb(): Promise<AppDatabase> {
  const client = new PGlite();
  await client.exec(initSql);
  const db = drizzle(client, { schema }) as unknown as AppDatabase;
  const catalog = buildSeedCatalog();

  await db.insert(clothingItems).values(catalog.clothingItems);
  await db.insert(outfitTemplates).values(catalog.outfitTemplates);
  await db.insert(outfitTemplateItems).values(catalog.outfitTemplateItems);
  await db.insert(moodWeatherOutfits).values(catalog.moodWeatherOutfits);

  return db;
}

export async function createTestApp(): Promise<FastifyInstance> {
  const db = await createTestDb();
  return buildApp({
    db,
    env: {
      port: 3001,
      databaseUrl: "",
      jwtSecret: "test-secret",
      cookieSecret: "test-cookie",
      frontendOrigin: "http://localhost:5173",
      nodeEnv: "test"
    }
  });
}
