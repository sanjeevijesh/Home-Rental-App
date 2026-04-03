// ============================================================
// FILE: src/routes/auth.js
// Authentication routes — register and login via Supabase Auth
// ============================================================

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabase");

// Valid roles for registration
const VALID_ROLES = ["tenant", "owner", "scout"];

/**
 * POST /api/auth/register
 * Create a new user with Supabase Auth + profile
 * Body: { name, phone, role, email, password }
 *
 * Priority: email+password is the primary auth method.
 * Phone is stored in the profile but NOT used for OTP (requires Twilio).
 */
router.post("/register", async (req, res) => {
  const { name, phone, role, email, password } = req.body;

  // ── Validation ──────────────────────────────────────────
  if (!name || !role) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "role", "email", "password"],
      optional: ["phone"],
    });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
    });
  }

  // FIX: Check email+password FIRST (before phone check).
  // The frontend sends all fields; the old code always hit the phone/OTP
  // branch which requires Twilio and caused the 500.
  if (!email || !password) {
    return res.status(400).json({
      error: "email and password are required for registration",
    });
  }

  // ── Create user via Admin API ────────────────────────────
  // FIX: admin.createUser with user_metadata maps to raw_user_meta_data
  // so the handle_new_user DB trigger can read name and role without
  // hitting a NOT NULL violation on profiles.name.
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,           // Auto-confirm — no email verification step
    user_metadata: { name, role }, // → raw_user_meta_data used by trigger
  });

  if (error) {
    // Surface Supabase errors (e.g. "User already registered") as 400
    return res.status(400).json({ error: error.message });
  }

  // ── Update phone in profile if provided ─────────────────
  // Wait for the DB trigger to finish inserting the profile row
  // before updating it (small retry loop handles timing).
  if (phone) {
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((r) => setTimeout(r, 300));
      const { error: updateErr } = await supabaseAdmin
        .from("profiles")
        .update({ phone })
        .eq("id", data.user.id);
      if (!updateErr) break;
    }
    // Non-fatal if phone update fails — user can update it later
  }

  // ── Sign in immediately to return a session ──────────────
  const { data: sessionData, error: signInError } =
    await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (signInError) {
    // Account was created but auto-login failed — still success
    return res.status(201).json({
      message: "Account created successfully. Please log in.",
      user: { id: data.user.id, email: data.user.email, role },
    });
  }

  return res.status(201).json({
    message: "Account created successfully",
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_at: sessionData.session.expires_at,
    },
    user: {
      id: sessionData.user.id,
      email: sessionData.user.email,
      role,
    },
  });
});

/**
 * POST /api/auth/login
 * Email/password login.
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Provide { email, password }",
    });
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  // Fetch the user's profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return res.status(200).json({
    message: "Login successful",
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
    user: {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
    },
    profile,
  });
});

module.exports = router;