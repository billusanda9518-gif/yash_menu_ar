-- ARMenu: Phase 2 schema additions
-- Add slug columns and analytics indexes

-- Add slug to menu_categories if not exists
ALTER TABLE menu_categories
  ADD COLUMN IF NOT EXISTS slug text;

-- Add slug to dishes if not exists
ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS slug text;

-- Add model_ios_url to dishes if not exists
ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS model_ios_url text;

-- Add composite index for analytics queries by date + restaurant
CREATE INDEX IF NOT EXISTS idx_analytics_events_restaurant_date
  ON analytics_events(restaurant_id, created_at DESC);

-- Add index for analytics event type + date queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date
  ON analytics_events(event_type, created_at DESC);
