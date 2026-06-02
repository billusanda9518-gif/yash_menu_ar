-- ARMenu: Initial Database Schema
-- Run this migration against your Supabase project.

-- ═══════════════════════════════════════════════════════════════════════════════
-- Custom Enum Types
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('super_admin', 'restaurant_owner', 'staff');
CREATE TYPE staff_role AS ENUM ('manager', 'staff');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'paused');
CREATE TYPE event_type AS ENUM ('page_view', 'menu_view', 'dish_view', 'ar_view', 'qr_scan', 'order_placed');

-- ═══════════════════════════════════════════════════════════════════════════════
-- Utility: updated_at trigger function
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Tables
-- ═══════════════════════════════════════════════════════════════════════════════

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  avatar_url  text,
  role        user_role NOT NULL DEFAULT 'restaurant_owner',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Restaurants
CREATE TABLE restaurants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  logo_url        text,
  cover_image_url text,
  address         text,
  phone           text,
  website         text,
  currency        text NOT NULL DEFAULT 'USD',
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Branches
CREATE TABLE branches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  address         text NOT NULL,
  phone           text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_branches_restaurant_id ON branches(restaurant_id);
CREATE TRIGGER branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Menu Categories
CREATE TABLE menu_categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  sort_order      integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_menu_categories_restaurant_id ON menu_categories(restaurant_id);
CREATE TRIGGER menu_categories_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dishes
CREATE TABLE dishes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id       uuid NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text,
  price             numeric(10,2) NOT NULL CHECK (price >= 0),
  currency          text NOT NULL DEFAULT 'USD',
  image_url         text,
  model_url         text,
  is_available      boolean NOT NULL DEFAULT true,
  is_featured       boolean NOT NULL DEFAULT false,
  sort_order        integer NOT NULL DEFAULT 0,
  allergens         text[] NOT NULL DEFAULT '{}',
  preparation_time  integer, -- in minutes
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category_id ON dishes(category_id);
CREATE TRIGGER dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tables (QR code tables in a branch)
CREATE TABLE tables (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  table_number    text NOT NULL,
  qr_code_url     text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, table_number)
);
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tables_branch_id ON tables(branch_id);
CREATE TRIGGER tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Restaurant Staff
CREATE TABLE restaurant_staff (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            staff_role NOT NULL DEFAULT 'staff',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, user_id)
);
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_restaurant_staff_restaurant_id ON restaurant_staff(restaurant_id);
CREATE INDEX idx_restaurant_staff_user_id ON restaurant_staff(user_id);
CREATE TRIGGER restaurant_staff_updated_at
  BEFORE UPDATE ON restaurant_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Analytics Events
CREATE TABLE analytics_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  event_type      event_type NOT NULL,
  metadata        jsonb,
  session_id      text,
  user_agent      text,
  ip_address      inet,
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_analytics_events_restaurant_id ON analytics_events(restaurant_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Subscriptions
CREATE TABLE subscriptions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan                      subscription_plan NOT NULL DEFAULT 'free',
  status                    subscription_status NOT NULL DEFAULT 'active',
  current_period_start      timestamptz NOT NULL DEFAULT now(),
  current_period_end        timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  cancel_at_period_end      boolean NOT NULL DEFAULT false,
  stripe_subscription_id    text,
  stripe_customer_id        text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- Trigger: Auto-create profile + free subscription on auth.users insert
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'restaurant_owner'
  );

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- Row Level Security Policies
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Profiles ──────────────────────────────────────────────────────────────────

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Restaurants ───────────────────────────────────────────────────────────────

CREATE POLICY "Owners can insert own restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can read own restaurants"
  ON restaurants FOR SELECT
  USING (
    auth.uid() = owner_id
    OR (is_active = true) -- public can read active restaurants
    OR EXISTS (
      SELECT 1 FROM restaurant_staff
      WHERE restaurant_staff.restaurant_id = restaurants.id
        AND restaurant_staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own restaurants"
  ON restaurants FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own restaurants"
  ON restaurants FOR DELETE
  USING (auth.uid() = owner_id);

-- ── Branches ──────────────────────────────────────────────────────────────────

CREATE POLICY "Owners can insert branches"
  ON branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read active branches"
  ON branches FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = branches.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update branches"
  ON branches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = branches.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete branches"
  ON branches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = branches.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- ── Menu Categories ──────────────────────────────────────────────────────────

CREATE POLICY "Owners can insert categories"
  ON menu_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read active categories"
  ON menu_categories FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_categories.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update categories"
  ON menu_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_categories.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete categories"
  ON menu_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_categories.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- ── Dishes ────────────────────────────────────────────────────────────────────

CREATE POLICY "Owners can insert dishes"
  ON dishes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read available dishes"
  ON dishes FOR SELECT
  USING (
    is_available = true
    OR EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update dishes"
  ON dishes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete dishes"
  ON dishes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE POLICY "Owners can insert tables"
  ON tables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM branches
      JOIN restaurants ON restaurants.id = branches.restaurant_id
      WHERE branches.id = branch_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can read tables"
  ON tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM branches
      JOIN restaurants ON restaurants.id = branches.restaurant_id
      WHERE branches.id = tables.branch_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update tables"
  ON tables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM branches
      JOIN restaurants ON restaurants.id = branches.restaurant_id
      WHERE branches.id = tables.branch_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete tables"
  ON tables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM branches
      JOIN restaurants ON restaurants.id = branches.restaurant_id
      WHERE branches.id = tables.branch_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- ── Restaurant Staff ─────────────────────────────────────────────────────────

CREATE POLICY "Owners can manage staff"
  ON restaurant_staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_staff.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can read own membership"
  ON restaurant_staff FOR SELECT
  USING (auth.uid() = user_id);

-- ── Analytics Events ──────────────────────────────────────────────────────────

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can read analytics for their restaurants"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = analytics_events.restaurant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- ── Subscriptions ─────────────────────────────────────────────────────────────

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
