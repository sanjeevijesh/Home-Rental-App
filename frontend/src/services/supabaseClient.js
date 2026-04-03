// ============================================================
// FILE: src/services/supabaseClient.js
// Supabase client for frontend (Realtime + Auth)
// ============================================================

import { createClient } from '@supabase/supabase-js';

// ⚠️ REPLACE WITH YOUR VALUES
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Store session in localStorage for persistence across tabs
    storage: localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
