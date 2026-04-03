// ============================================================
// FILE: src/routes/users.js
// User profile and preference routes
// ============================================================

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabase");
const { requireAuth } = require("../middleware/auth");

const VALID_AREAS = [
  "New Bus Stand", "Old Bus Stand", "Millerpuram", "3rd Mile",
  "Bryant Nagar", "Therespuram", "Harbour Area", "SPIC Nagar",
  "Kattur", "VOC Nagar",
];

/**
 * GET /api/users/profile
 * Get the current user's profile
 * Auth: Any JWT
 */
router.get("/profile", requireAuth, async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error || !profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  return res.json({ profile });
});

/**
 * POST /api/users/preferences
 * Update tenant's preferred areas and budget range
 * Auth: Tenant JWT required
 * Body: { preferred_areas: [], budget_min, budget_max }
 */
router.post("/preferences", requireAuth, async (req, res) => {
  const { preferred_areas, budget_min, budget_max } = req.body;

  // Validation
  const errors = [];

  if (preferred_areas) {
    if (!Array.isArray(preferred_areas)) {
      errors.push("preferred_areas must be an array");
    } else {
      const invalidAreas = preferred_areas.filter((a) => !VALID_AREAS.includes(a));
      if (invalidAreas.length > 0) {
        errors.push(`Invalid areas: ${invalidAreas.join(", ")}. Valid: ${VALID_AREAS.join(", ")}`);
      }
    }
  }

  if (budget_min !== undefined && (isNaN(budget_min) || budget_min < 0)) {
    errors.push("budget_min must be a non-negative number");
  }

  if (budget_max !== undefined && (isNaN(budget_max) || budget_max < 0)) {
    errors.push("budget_max must be a non-negative number");
  }

  if (budget_min !== undefined && budget_max !== undefined && budget_min > budget_max) {
    errors.push("budget_min cannot be greater than budget_max");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // Build update object (only include fields that were provided)
  const updates = {};
  if (preferred_areas !== undefined) updates.preferred_areas = preferred_areas;
  if (budget_min !== undefined) updates.budget_min = parseInt(budget_min);
  if (budget_max !== undefined) updates.budget_max = parseInt(budget_max);

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to update preferences", details: error.message });
  }

  return res.json({
    message: "Preferences updated successfully",
    profile,
  });
});

/**
 * PATCH /api/users/profile
 * Update basic profile info (name, phone)
 * Auth: Any JWT
 */
router.patch("/profile", requireAuth, async (req, res) => {
  const { name, phone } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to update profile", details: error.message });
  }

  return res.json({
    message: "Profile updated",
    profile,
  });
});

module.exports = router;
