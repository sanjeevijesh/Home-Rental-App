-- ============================================================
-- MIGRATION: Remove Firebase / Add in-app notification fields
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Remove fcm_token from profiles (no longer needed without Firebase)
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS fcm_token;

-- 2. Add title, body, and read columns to alerts table
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body  text,
  ADD COLUMN IF NOT EXISTS read  boolean NOT NULL DEFAULT false;

-- 3. Add composite index for fast unread count queries
CREATE INDEX IF NOT EXISTS idx_alerts_user_read
  ON public.alerts (user_id, read);

-- 4. Add UPDATE RLS policy so users can mark their own alerts as read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'alerts' AND policyname = 'alerts_update_own'
  ) THEN
    CREATE POLICY "alerts_update_own"
      ON public.alerts FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Done! Your database is now Firebase-free and Supabase-native.
-- Tenants receive notifications via Supabase Realtime subscriptions.
