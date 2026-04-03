-- ============================================================
-- Nearby Rental Finder — Supabase SQL Schema
-- Run this in the Supabase SQL Editor (in order)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Extensions
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ────────────────────────────────────────────────────────────
-- 1. Enum-like CHECK constraints (using CHECK instead of ENUM
--    so Supabase Dashboard plays nicely)
-- ────────────────────────────────────────────────────────────

-- We'll use CHECK constraints inline rather than CREATE TYPE
-- because Supabase migrations handle them more cleanly.

-- ────────────────────────────────────────────────────────────
-- 2. PROFILES table (extends auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  phone           text,
  role            text NOT NULL CHECK (role IN ('tenant', 'owner', 'scout')),
  preferred_areas text[] DEFAULT '{}',
  budget_min      int DEFAULT 0,
  budget_max      int DEFAULT 100000,
  points          int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- Index for leaderboard queries (scouts sorted by points)
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles (points DESC);
-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';

-- ────────────────────────────────────────────────────────────
-- 3. PROPERTIES table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.properties (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  area          text NOT NULL CHECK (area IN (
                  'New Bus Stand', 'Old Bus Stand', 'Millerpuram', '3rd Mile',
                  'Bryant Nagar', 'Therespuram', 'Harbour Area', 'SPIC Nagar',
                  'Kattur', 'VOC Nagar'
                )),
  rent          int NOT NULL CHECK (rent > 0),
  type          text CHECK (type IN ('1BHK', '2BHK', '3BHK', 'Single Room', 'Shop')),
  furnished     text CHECK (furnished IN ('furnished', 'semi', 'unfurnished')),
  tenant_type   text CHECK (tenant_type IN ('family', 'bachelor', 'any')),
  status        text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  phone         text NOT NULL,
  whatsapp      text,
  images        text[] DEFAULT '{}',
  owner_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verified      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Indexes for the most common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties (area);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON public.properties (rent);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties (owner_id);
-- Composite index for the main listing query
CREATE INDEX IF NOT EXISTS idx_properties_area_status_rent
  ON public.properties (area, status, rent);

COMMENT ON TABLE public.properties IS 'Rental property listings posted by owners';

-- ────────────────────────────────────────────────────────────
-- 4. SCOUT_REPORTS table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scout_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url       text NOT NULL,
  area            text NOT NULL CHECK (area IN (
                    'New Bus Stand', 'Old Bus Stand', 'Millerpuram', '3rd Mile',
                    'Bryant Nagar', 'Therespuram', 'Harbour Area', 'SPIC Nagar',
                    'Kattur', 'VOC Nagar'
                  )),
  lat             float8,
  lng             float8,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reward_points   int DEFAULT 10,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scout_reports_scout ON public.scout_reports (scout_id);
CREATE INDEX IF NOT EXISTS idx_scout_reports_status ON public.scout_reports (status);

COMMENT ON TABLE public.scout_reports IS 'Photos of To-Let boards uploaded by scouts';

-- ────────────────────────────────────────────────────────────
-- 5. ALERTS table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id   uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  title         text,                          -- Notification title
  body          text,                          -- Notification message
  read          boolean NOT NULL DEFAULT false, -- Whether the user has read it
  notified_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user      ON public.alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON public.alerts (user_id, read); -- fast unread count

COMMENT ON TABLE public.alerts IS 'In-app notifications for tenants about new matching properties';

-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts        ENABLE ROW LEVEL SECURITY;

-- ── PROFILES policies ──────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── PROPERTIES policies ────────────────────────────────────

-- Anyone (authenticated or anon) can read available listings
CREATE POLICY "properties_select_available"
  ON public.properties FOR SELECT
  USING (status = 'available' OR owner_id = auth.uid());

-- Only the owner can insert their own properties
CREATE POLICY "properties_insert_owner"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only the owner can update their own properties
CREATE POLICY "properties_update_owner"
  ON public.properties FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ── SCOUT_REPORTS policies ─────────────────────────────────

-- Scouts can insert their own reports
CREATE POLICY "scout_reports_insert_scout"
  ON public.scout_reports FOR INSERT
  WITH CHECK (auth.uid() = scout_id);

-- Scouts can view their own reports
CREATE POLICY "scout_reports_select_own"
  ON public.scout_reports FOR SELECT
  USING (auth.uid() = scout_id);

-- Admins can update report status (using service role key from backend)
-- Note: service_role key bypasses RLS, so admin updates go through the backend

-- ── ALERTS policies ────────────────────────────────────────

-- Users can only read their own alerts
CREATE POLICY "alerts_select_own"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own alerts as read
CREATE POLICY "alerts_update_own"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System inserts alerts via service role key (bypasses RLS, no policy needed)

-- ────────────────────────────────────────────────────────────
-- 7. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────

-- Create storage buckets (run this via Supabase Dashboard or API)
-- These statements work in the SQL editor if the storage schema exists:
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('property-images', 'property-images', true),
  ('scout-images', 'scout-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow authenticated uploads, public reads
CREATE POLICY "property_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "property_images_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "scout_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'scout-images');

CREATE POLICY "scout_images_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'scout-images'
    AND auth.role() = 'authenticated'
  );

-- ────────────────────────────────────────────────────────────
-- 8. FUNCTION + TRIGGER for Realtime notifications
-- ────────────────────────────────────────────────────────────

-- Enable Realtime on the properties table
-- (Do this in Supabase Dashboard → Database → Replication → 
--  enable "properties" table for Realtime)

-- Trigger function to invoke the Edge Function on new property insert
CREATE OR REPLACE FUNCTION public.handle_new_property()
RETURNS trigger AS $$
BEGIN
  -- This function is a placeholder — the actual notification logic
  -- runs in the Supabase Edge Function "notify-on-new-property"
  -- which is invoked via a database webhook (configured in Dashboard).
  -- 
  -- Alternatively, you can use pg_net to call the Edge Function:
  -- PERFORM net.http_post(
  --   url := 'https://YOUR_PROJECT.supabase.co/functions/v1/notify-on-new-property',
  --   headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
  --   body := row_to_json(NEW)::jsonb
  -- );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_property_insert
  AFTER INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_property();

-- ────────────────────────────────────────────────────────────
-- 9. HELPER: Auto-create profile on auth signup
-- ────────────────────────────────────────────────────────────

-- This trigger creates a minimal profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
