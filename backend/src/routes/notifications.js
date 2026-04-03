// ============================================================
// FILE: src/routes/notifications.js
// Notification routes — Supabase-only (no Firebase)
// ============================================================

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabase");
const { requireAuth } = require("../middleware/auth");

/**
 * GET /api/notifications/my-alerts
 * Get the current user's notification history
 * Auth: Any JWT required
 */
router.get("/my-alerts", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("alerts")
    .select("*, properties(*)")
    .eq("user_id", req.user.id)
    .order("notified_at", { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).json({ error: "Failed to fetch alerts" });
  }

  return res.json({ alerts: data || [] });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 * Auth: Any JWT required
 */
router.patch("/:id/read", requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("alerts")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", req.user.id) // Ensure user owns this alert
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to mark alert as read" });
  }

  if (!data) {
    return res.status(404).json({ error: "Alert not found" });
  }

  return res.json({ message: "Alert marked as read", alert: data });
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 * Auth: Any JWT required
 */
router.get("/unread-count", requireAuth, async (req, res) => {
  const { count, error } = await supabaseAdmin
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", req.user.id)
    .eq("read", false);

  if (error) {
    return res.status(500).json({ error: "Failed to count unread alerts" });
  }

  return res.json({ unread: count || 0 });
});

module.exports = router;
