// ============================================================
// FILE: src/routes/scouts.js
// Scout routes — report uploads and leaderboard
// ============================================================

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabase");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uploadScoutImage } = require("../middleware/upload");
const crypto = require("crypto");

const VALID_AREAS = [
  "New Bus Stand", "Old Bus Stand", "Millerpuram", "3rd Mile",
  "Bryant Nagar", "Therespuram", "Harbour Area", "SPIC Nagar",
  "Kattur", "VOC Nagar",
];

/**
 * POST /api/scouts/report
 * Upload a "To Let" board photo as a scout report
 * Auth: Scout JWT required
 */
router.post("/report", requireAuth, requireRole("scout"), (req, res, next) => {
  uploadScoutImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: "Image upload failed",
        details: err.message,
      });
    }
    next();
  });
}, async (req, res) => {
  const { area, lat, lng } = req.body;

  // Validation
  if (!area || !VALID_AREAS.includes(area)) {
    return res.status(400).json({
      error: `area is required and must be one of: ${VALID_AREAS.join(", ")}`,
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

  // Upload image to Supabase Storage
  const fileName = `${req.user.id}/${crypto.randomUUID()}-${req.file.originalname}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("scout-images")
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    return res.status(500).json({
      error: "Failed to upload image",
      details: uploadError.message,
    });
  }

  // Get the public URL
  const { data: urlData } = supabaseAdmin.storage
    .from("scout-images")
    .getPublicUrl(fileName);

  // Insert the scout report
  const { data: report, error: insertError } = await supabaseAdmin
    .from("scout_reports")
    .insert({
      scout_id: req.user.id,
      image_url: urlData.publicUrl,
      area,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
    })
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({
      error: "Failed to create report",
      details: insertError.message,
    });
  }

  // Award points to the scout (10 points per report, awarded on approval)
  // For MVP, we award immediately — in production, award only on approval
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("points")
    .eq("id", req.user.id)
    .single();

  const newPoints = (profile?.points || 0) + 10;

  await supabaseAdmin
    .from("profiles")
    .update({ points: newPoints })
    .eq("id", req.user.id);

  // Get scout's rank
  const { data: allScouts } = await supabaseAdmin
    .from("profiles")
    .select("id, points")
    .eq("role", "scout")
    .order("points", { ascending: false });

  const rank = (allScouts || []).findIndex((s) => s.id === req.user.id) + 1;

  return res.status(201).json({
    message: "Report submitted successfully! +10 points 🎉",
    report,
    scout: {
      points: newPoints,
      rank,
    },
  });
});

/**
 * GET /api/scouts/leaderboard
 * Return top 10 scouts ordered by points
 * Public route
 */
router.get("/leaderboard", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, points")
    .eq("role", "scout")
    .order("points", { ascending: false })
    .limit(10);

  if (error) {
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }

  // Add rank to each entry
  const leaderboard = (data || []).map((scout, index) => ({
    rank: index + 1,
    ...scout,
  }));

  return res.json({ leaderboard });
});

/**
 * GET /api/scouts/my-reports
 * Get the current scout's reports
 * Auth: Scout JWT required
 */
router.get("/my-reports", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("scout_reports")
    .select("*")
    .eq("scout_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: "Failed to fetch reports" });
  }

  return res.json({ reports: data || [] });
});

module.exports = router;
