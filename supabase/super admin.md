-- ============================================================
-- Migration: 002_super_admin.sql
-- Adds super_admin role, advertisements table, suspension system,
-- admin action logs, and updated RLS policies
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Extend profiles role CHECK ──────────────────────────
-- Drop old constraint, add super_admin
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('tenant', 'owner', 'scout', 'super_admin'));

-- ── 2. Add suspended / suspended_at columns to profiles ────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_at   timestamptz,
  ADD COLUMN IF NOT EXISTS suspend_reason text;

-- ── 3. ADVERTISEMENTS table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.advertisements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_by    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  active        boolean NOT NULL DEFAULT true,
  frequency     text NOT NULL DEFAULT 'always'
                  CHECK (frequency IN ('always', 'once_per_session', 'once_per_day')),
  starts_at     timestamptz DEFAULT now(),
  ends_at       timestamptz,                 -- null = no expiry
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_active      ON public.advertisements (active);
CREATE INDEX IF NOT EXISTS idx_ads_property    ON public.advertisements (property_id);

COMMENT ON TABLE public.advertisements IS 'Properties promoted as popup ads by super admin';

-- ── 4. ADMIN_LOGS table (audit trail) ──────────────────────
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action      text NOT NULL,      -- e.g. 'delete_property', 'suspend_user', 'set_ad'
  target_type text NOT NULL,      -- 'property' | 'user' | 'advertisement' | 'scout_report'
  target_id   uuid,               -- ID of the affected row
  meta        jsonb DEFAULT '{}', -- extra context (old values, reason, etc.)
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin  ON public.admin_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs (action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_time   ON public.admin_logs (created_at DESC);

COMMENT ON TABLE public.admin_logs IS 'Audit log for every super_admin action';

-- ── 5. Add 'flagged' status to properties ──────────────────
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_status_check
  CHECK (status IN ('available', 'occupied', 'flagged', 'deleted'));

-- ── 6. RLS policies — super_admin bypasses via service key ─
-- (Backend uses supabaseAdmin with service_role key which already bypasses RLS.)
-- The policies below keep the DB clean for direct client access.

-- Allow super_admin to read all profiles
CREATE POLICY IF NOT EXISTS "superadmin_read_profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'super_admin'
    )
  );

-- Advertisements: public read for active ads
CREATE POLICY "ads_public_read"
  ON public.advertisements FOR SELECT
  USING (active = true);

-- Advertisements: only super_admin can insert/update/delete
CREATE POLICY "ads_superadmin_all"
  ON public.advertisements FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'super_admin'
    )
  );

ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Admin logs: only super_admin can read/insert
CREATE POLICY "admin_logs_superadmin"
  ON public.admin_logs FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'super_admin'
    )
  );

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ── 7. ANALYTICS VIEW ──────────────────────────────────────
CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT
  (SELECT COUNT(*)  FROM public.profiles)                                     AS total_users,
  (SELECT COUNT(*)  FROM public.profiles  WHERE role = 'tenant')              AS total_tenants,
  (SELECT COUNT(*)  FROM public.profiles  WHERE role = 'owner')               AS total_owners,
  (SELECT COUNT(*)  FROM public.profiles  WHERE role = 'scout')               AS total_scouts,
  (SELECT COUNT(*)  FROM public.profiles  WHERE suspended = true)             AS suspended_users,
  (SELECT COUNT(*)  FROM public.properties)                                    AS total_properties,
  (SELECT COUNT(*)  FROM public.properties WHERE status = 'available')         AS available_properties,
  (SELECT COUNT(*)  FROM public.properties WHERE status = 'occupied')          AS occupied_properties,
  (SELECT COUNT(*)  FROM public.properties WHERE status = 'flagged')           AS flagged_properties,
  (SELECT COUNT(*)  FROM public.properties WHERE created_at > now() - interval '1 day')   AS new_properties_today,
  (SELECT COUNT(*)  FROM public.properties WHERE created_at > now() - interval '7 days')  AS new_properties_week,
  (SELECT COUNT(*)  FROM public.properties WHERE created_at > now() - interval '30 days') AS new_properties_month,
  (SELECT COUNT(*)  FROM public.profiles   WHERE created_at > now() - interval '1 day')   AS new_users_today,
  (SELECT COUNT(*)  FROM public.profiles   WHERE created_at > now() - interval '7 days')  AS new_users_week,
  (SELECT COUNT(*)  FROM public.scout_reports)                                 AS total_scout_reports,
  (SELECT COUNT(*)  FROM public.scout_reports WHERE status = 'pending')        AS pending_reports,
  (SELECT COUNT(*)  FROM public.advertisements WHERE active = true)            AS active_ads;

COMMENT ON VIEW public.admin_analytics IS 'Pre-aggregated platform stats for super_admin dashboard';