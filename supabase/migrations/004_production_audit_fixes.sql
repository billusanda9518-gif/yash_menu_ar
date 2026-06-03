-- ARMenu: Phase 4 — Schema fixes for production audit
-- Run this migration after 001_initial_schema.sql and 003_phase3_stripe.sql

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix 1: Add missing `slug` column to `menu_categories`
-- The code generates and inserts slugs, but the column was never in the schema.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_categories' AND column_name = 'slug'
  ) THEN
    ALTER TABLE menu_categories ADD COLUMN slug text;
    -- Backfill existing rows with a slug derived from the name
    UPDATE menu_categories SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Now make it NOT NULL
    ALTER TABLE menu_categories ALTER COLUMN slug SET NOT NULL;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix 2: Add missing `slug` column to `dishes`
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dishes' AND column_name = 'slug'
  ) THEN
    ALTER TABLE dishes ADD COLUMN slug text;
    UPDATE dishes SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
    ALTER TABLE dishes ALTER COLUMN slug SET NOT NULL;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix 3: Add missing `model_ios_url` column to `dishes`
-- Used for iOS-specific USDZ AR model files.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dishes' AND column_name = 'model_ios_url'
  ) THEN
    ALTER TABLE dishes ADD COLUMN model_ios_url text;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix 4: Make `dishes.category_id` nullable
-- The code allows dishes without a category ("No category" option),
-- but the schema has `NOT NULL`. This causes INSERT failures.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE dishes ALTER COLUMN category_id DROP NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix 5: Add missing `stripe_price_id` column to `subscriptions`
-- (Idempotent — skips if 003_phase3_stripe.sql already added it)
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_price_id text;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix 6: Add missing RLS policy for subscriptions UPDATE
-- The webhook handler updates subscriptions via supabaseAdmin (bypasses RLS),
-- but users should also be able to read their own subscription (already exists).
-- Adding an explicit UPDATE policy for completeness.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscription'
  ) THEN
    CREATE POLICY "Users can update own subscription"
      ON subscriptions FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
