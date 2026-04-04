// ============================================================
// FILE: src/routes/admin.js
// Super Admin routes — full platform control
// All routes require JWT + super_admin role (enforced via middleware)
// ============================================================

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabase");
const { requireAuth, requireRole } = require("../middleware/auth");

// Every admin route needs auth + super_admin role
const adminGuard = [requireAuth, requireRole("super_admin")];

// ── Helper: write an audit log entry ──────────────────────
async function logAction(adminId, action, targetType, targetId, meta = {}) {
  await supabaseAdmin.from("admin_logs").insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId || null,
    meta,
  });
}

// ============================================================
// ANALYTICS
// ============================================================

/**
 * GET /api/admin/analytics
 * Platform-wide stats from the admin_analytics view
 */
router.get("/analytics", adminGuard, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("admin_analytics")
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to fetch analytics", details: error.message });
  }

  // Also get area-wise breakdown
  const { data: areaStats } = await supabaseAdmin
    .from("properties")
    .select("area, status")
    .neq("status", "deleted");

  const areaBreakdown = {};
  (areaStats || []).forEach(({ area, status }) => {
    if (!areaBreakdown[area]) areaBreakdown[area] = { available: 0, occupied: 0, flagged: 0 };
    areaBreakdown[area][status] = (areaBreakdown[area][status] || 0) + 1;
  });

  // Growth trend — properties per day for last 30 days
  const { data: trend } = await supabaseAdmin.rpc
    ? await supabaseAdmin
        .from("properties")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true })
    : { data: [] };

  return res.json({ analytics: data, areaBreakdown, trend: trend || [] });
});

// ============================================================
// USER MANAGEMENT
// ============================================================

/**
 * GET /api/admin/users
 * List all users with pagination and role filter
 * Query: role, search, suspended, page, limit
 */
router.get("/users", adminGuard, async (req, res) => {
  const { role, search, suspended, page = 1, limit = 30 } = req.query;

  let query = supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (role) query = query.eq("role", role);
  if (suspended === "true")  query = query.eq("suspended", true);
  if (suspended === "false") query = query.eq("suspended", false);
  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);

  const pageNum  = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
  const from = (pageNum - 1) * pageSize;
  const to   = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: "Failed to fetch users", details: error.message });

  return res.json({
    users: data || [],
    pagination: { page: pageNum, limit: pageSize, total: count || 0, hasMore: to < (count || 0) - 1 },
  });
});

/**
 * GET /api/admin/users/:id
 * Get a single user's profile + their property listings + activity
 */
router.get("/users/:id", adminGuard, async (req, res) => {
  const { id } = req.params;

  const [profileRes, propertiesRes, reportsRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").eq("id", id).single(),
    supabaseAdmin.from("properties").select("*").eq("owner_id", id).order("created_at", { ascending: false }),
    supabaseAdmin.from("scout_reports").select("*").eq("scout_id", id).order("created_at", { ascending: false }),
  ]);

  if (profileRes.error || !profileRes.data) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    user: profileRes.data,
    properties: propertiesRes.data || [],
    scoutReports: reportsRes.data || [],
  });
});

/**
 * PATCH /api/admin/users/:id/suspend
 * Suspend or reactivate a user
 * Body: { suspended: true|false, reason?: string }
 */
router.patch("/users/:id/suspend", adminGuard, async (req, res) => {
  const { id } = req.params;
  const { suspended, reason } = req.body;

  if (typeof suspended !== "boolean") {
    return res.status(400).json({ error: "suspended must be true or false" });
  }

  const updates = {
    suspended,
    suspended_at:   suspended ? new Date().toISOString() : null,
    suspend_reason: suspended ? (reason || null) : null,
  };

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: "Failed to update suspension", details: error.message });

  await logAction(req.user.id, suspended ? "suspend_user" : "reactivate_user", "user", id, { reason });

  return res.json({
    message: suspended ? "User suspended" : "User reactivated",
    user: data,
  });
});

// ============================================================
// PROPERTY MANAGEMENT
// ============================================================

/**
 * GET /api/admin/properties
 * List ALL properties (all statuses) with owner info
 * Query: status, area, search, page, limit
 */
router.get("/properties", adminGuard, async (req, res) => {
  const { status, area, search, page = 1, limit = 30 } = req.query;

  let query = supabaseAdmin
    .from("properties")
    .select("*, profiles!owner_id(id, name, phone, role, suspended)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (area)   query = query.eq("area", area);
  if (search) query = query.ilike("title", `%${search}%`);

  const pageNum  = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
  const from = (pageNum - 1) * pageSize;
  const to   = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: "Failed to fetch properties", details: error.message });

  return res.json({
    properties: data || [],
    pagination: { page: pageNum, limit: pageSize, total: count || 0, hasMore: to < (count || 0) - 1 },
  });
});

/**
 * PATCH /api/admin/properties/:id
 * Update any field on any property (title, rent, status, etc.)
 * Body: { title?, rent?, status?, area?, type?, furnished?, tenant_type? }
 */
router.patch("/properties/:id", adminGuard, async (req, res) => {
  const { id } = req.params;
  const allowed = ["title", "rent", "status", "area", "type", "furnished", "tenant_type", "phone", "whatsapp"];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const { data, error } = await supabaseAdmin
    .from("properties")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: "Failed to update property", details: error.message });

  await logAction(req.user.id, "update_property", "property", id, { updates });

  return res.json({ message: "Property updated", property: data });
});

/**
 * DELETE /api/admin/properties/:id
 * Soft-delete a property (sets status to 'deleted')
 */
router.delete("/properties/:id", adminGuard, async (req, res) => {
  const { id } = req.params;

  // Fetch before deleting for audit log
  const { data: existing } = await supabaseAdmin
    .from("properties").select("title, area, rent").eq("id", id).single();

  const { error } = await supabaseAdmin
    .from("properties")
    .update({ status: "deleted" })
    .eq("id", id);

  if (error) return res.status(500).json({ error: "Failed to delete property", details: error.message });

  await logAction(req.user.id, "delete_property", "property", id, existing || {});

  return res.json({ message: "Property removed from platform" });
});

/**
 * PATCH /api/admin/properties/:id/flag
 * Flag a property as suspicious
 */
router.patch("/properties/:id/flag", adminGuard, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const { data, error } = await supabaseAdmin
    .from("properties")
    .update({ status: "flagged" })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: "Failed to flag property" });

  await logAction(req.user.id, "flag_property", "property", id, { reason });

  return res.json({ message: "Property flagged for review", property: data });
});

// ============================================================
// SCOUT REPORTS
// ============================================================

/**
 * GET /api/admin/scout-reports
 * All scout reports with scout info
 */
router.get("/scout-reports", adminGuard, async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;

  let query = supabaseAdmin
    .from("scout_reports")
    .select("*, profiles!scout_id(name, phone)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const pageNum  = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
  query = query.range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: "Failed to fetch reports" });

  return res.json({
    reports: data || [],
    pagination: { page: pageNum, limit: pageSize, total: count || 0 },
  });
});

/**
 * PATCH /api/admin/scout-reports/:id
 * Approve or reject a scout report
 * Body: { status: 'approved' | 'rejected' }
 */
router.patch("/scout-reports/:id", adminGuard, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status must be approved or rejected" });
  }

  const { data, error } = await supabaseAdmin
    .from("scout_reports")
    .update({ status })
    .eq("id", id)
    .select("*, profiles!scout_id(id, points)")
    .single();

  if (error) return res.status(500).json({ error: "Failed to update report" });

  // Award points on approval
  if (status === "approved" && data?.profiles?.id) {
    const currentPoints = data.profiles.points || 0;
    await supabaseAdmin
      .from("profiles")
      .update({ points: currentPoints + (data.reward_points || 10) })
      .eq("id", data.profiles.id);
  }

  await logAction(req.user.id, `${status}_scout_report`, "scout_report", id);

  return res.json({ message: `Report ${status}`, report: data });
});

// ============================================================
// ADVERTISEMENTS
// ============================================================

/**
 * GET /api/admin/ads
 * List all ads (active + inactive)
 */
router.get("/ads", adminGuard, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("advertisements")
    .select("*, properties(id, title, area, rent, type, images, status), profiles!created_by(name)")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: "Failed to fetch ads" });

  return res.json({ ads: data || [] });
});

/**
 * GET /api/admin/ads/active
 * Public-ish route: get the currently active ad for popup display
 * No admin auth needed — frontend needs this
 */
router.get("/ads/active", async (req, res) => {
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("advertisements")
    .select("*, properties(id, title, area, rent, type, images, status, phone, whatsapp)")
    .eq("active", true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .lte("starts_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return res.status(500).json({ error: "Failed to fetch active ad" });

  return res.json({ ad: data || null });
});

/**
 * POST /api/admin/ads
 * Create a new advertisement for a property
 * Body: { property_id, frequency?, ends_at? }
 */
router.post("/ads", adminGuard, async (req, res) => {
  const { property_id, frequency = "always", ends_at } = req.body;

  if (!property_id) return res.status(400).json({ error: "property_id is required" });

  // Deactivate all existing ads first (only one active ad at a time)
  await supabaseAdmin.from("advertisements").update({ active: false }).eq("active", true);

  const { data, error } = await supabaseAdmin
    .from("advertisements")
    .insert({ property_id, frequency, ends_at: ends_at || null, created_by: req.user.id, active: true })
    .select("*, properties(title, area)")
    .single();

  if (error) return res.status(500).json({ error: "Failed to create advertisement", details: error.message });

  await logAction(req.user.id, "create_ad", "advertisement", data.id, { property_id, frequency });

  return res.status(201).json({ message: "Advertisement created", ad: data });
});

/**
 * PATCH /api/admin/ads/:id/toggle
 * Activate or deactivate an ad
 */
router.patch("/ads/:id/toggle", adminGuard, async (req, res) => {
  const { id } = req.params;

  const { data: existing } = await supabaseAdmin
    .from("advertisements").select("active").eq("id", id).single();

  if (!existing) return res.status(404).json({ error: "Ad not found" });

  const newActive = !existing.active;

  // If activating, deactivate others
  if (newActive) {
    await supabaseAdmin.from("advertisements").update({ active: false }).eq("active", true);
  }

  const { data, error } = await supabaseAdmin
    .from("advertisements")
    .update({ active: newActive })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: "Failed to toggle ad" });

  await logAction(req.user.id, newActive ? "activate_ad" : "deactivate_ad", "advertisement", id);

  return res.json({ message: `Ad ${newActive ? "activated" : "deactivated"}`, ad: data });
});

/**
 * DELETE /api/admin/ads/:id
 * Remove an advertisement permanently
 */
router.delete("/ads/:id", adminGuard, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin.from("advertisements").delete().eq("id", id);
  if (error) return res.status(500).json({ error: "Failed to delete ad" });

  await logAction(req.user.id, "delete_ad", "advertisement", id);

  return res.json({ message: "Advertisement removed" });
});

// ============================================================
// AUDIT LOGS
// ============================================================

/**
 * GET /api/admin/logs
 * Fetch audit log with optional filters
 * Query: action, limit, page
 */
router.get("/logs", adminGuard, async (req, res) => {
  const { action, page = 1, limit = 50 } = req.query;

  let query = supabaseAdmin
    .from("admin_logs")
    .select("*, profiles!admin_id(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (action) query = query.eq("action", action);

  const pageNum  = Math.max(1, parseInt(page));
  const pageSize = Math.min(200, Math.max(1, parseInt(limit)));
  query = query.range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: "Failed to fetch logs" });

  return res.json({ logs: data || [], total: count || 0 });
});

module.exports = router;