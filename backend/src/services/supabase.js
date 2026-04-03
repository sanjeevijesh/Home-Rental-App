// ============================================================
// FILE: src/services/supabase.js
// Supabase client singletons (anon + service role)
// ============================================================

const { createClient } = require("@supabase/supabase-js");

// Use placeholder values if env vars are missing so the server can still start
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

if (SUPABASE_URL.includes('placeholder') || SUPABASE_ANON_KEY === 'placeholder') {
  console.warn("⚠️  Supabase credentials not configured. API calls will fail.");
  console.warn("   → Copy backend/.env.example to backend/.env and fill in your Supabase keys.");
}

// Public client — respects RLS, used for user-scoped operations
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — bypasses RLS, used for server-side operations
// (e.g., creating profiles, updating scout reports, sending alerts)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabase, supabaseAdmin };
