-- ARMenu: Phase 3 — Stripe subscription support
-- Adds stripe_price_id column to subscriptions table

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_price_id text;
