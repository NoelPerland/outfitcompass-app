export const initSql = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clothing_items (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  default_color TEXT NOT NULL,
  warmth_level INTEGER NOT NULL,
  waterproof BOOLEAN NOT NULL DEFAULT FALSE,
  style_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outfit_templates (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  palette_name TEXT NOT NULL,
  palette_colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  practical_note TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outfit_template_items (
  id UUID PRIMARY KEY,
  outfit_template_id UUID NOT NULL REFERENCES outfit_templates(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  layer_order INTEGER NOT NULL,
  color_override TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_weather_outfits (
  id UUID PRIMARY KEY,
  mood TEXT NOT NULL,
  condition TEXT NOT NULL,
  temp_band TEXT NOT NULL,
  outfit_template_id UUID NOT NULL REFERENCES outfit_templates(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT mood_weather_unique UNIQUE (mood, condition, temp_band, outfit_template_id)
);

CREATE TABLE IF NOT EXISTS saved_outfits (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_template_id UUID REFERENCES outfit_templates(id) ON DELETE SET NULL,
  mood TEXT NOT NULL,
  resolved_condition TEXT NOT NULL,
  resolved_temp_band TEXT NOT NULL,
  resolved_temperature_c DOUBLE PRECISION NOT NULL,
  weather_summary TEXT NOT NULL,
  title TEXT NOT NULL,
  practical_note TEXT NOT NULL,
  palette_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mood_weather_lookup_idx
  ON mood_weather_outfits (mood, condition, temp_band, priority);

CREATE INDEX IF NOT EXISTS outfit_template_items_lookup_idx
  ON outfit_template_items (outfit_template_id, layer_order);

CREATE INDEX IF NOT EXISTS saved_outfits_user_created_idx
  ON saved_outfits (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS saved_outfits_user_template_idx
  ON saved_outfits (user_id, outfit_template_id);
`;
