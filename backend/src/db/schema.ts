import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex("users_email_unique_idx").on(table.email)
  })
);

export const clothingItems = pgTable("clothing_items", {
  id: uuid("id").primaryKey(),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  defaultColor: text("default_color").notNull(),
  warmthLevel: integer("warmth_level").notNull(),
  waterproof: boolean("waterproof").notNull().default(false),
  styleTags: jsonb("style_tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const outfitTemplates = pgTable("outfit_templates", {
  id: uuid("id").primaryKey(),
  title: text("title").notNull(),
  paletteName: text("palette_name").notNull(),
  paletteColors: jsonb("palette_colors").$type<string[]>().notNull().default([]),
  practicalNote: text("practical_note").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const outfitTemplateItems = pgTable("outfit_template_items", {
  id: uuid("id").primaryKey(),
  outfitTemplateId: uuid("outfit_template_id")
    .notNull()
    .references(() => outfitTemplates.id, { onDelete: "cascade" }),
  clothingItemId: uuid("clothing_item_id")
    .notNull()
    .references(() => clothingItems.id, { onDelete: "cascade" }),
  layerOrder: integer("layer_order").notNull(),
  colorOverride: text("color_override"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const moodWeatherOutfits = pgTable("mood_weather_outfits", {
  id: uuid("id").primaryKey(),
  mood: text("mood").notNull(),
  condition: text("condition").notNull(),
  tempBand: text("temp_band").notNull(),
  outfitTemplateId: uuid("outfit_template_id")
    .notNull()
    .references(() => outfitTemplates.id, { onDelete: "cascade" }),
  priority: integer("priority").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const savedOutfits = pgTable("saved_outfits", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  outfitTemplateId: uuid("outfit_template_id").references(() => outfitTemplates.id, {
    onDelete: "set null"
  }),
  mood: text("mood").notNull(),
  resolvedCondition: text("resolved_condition").notNull(),
  resolvedTempBand: text("resolved_temp_band").notNull(),
  resolvedTemperatureC: doublePrecision("resolved_temperature_c").notNull(),
  weatherSummary: text("weather_summary").notNull(),
  title: text("title").notNull(),
  practicalNote: text("practical_note").notNull(),
  paletteSnapshot: jsonb("palette_snapshot").$type<string[]>().notNull().default([]),
  itemsSnapshot: jsonb("items_snapshot")
    .$type<Array<{ category: string; name: string; color: string }>>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
