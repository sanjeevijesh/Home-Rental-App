// ============================================================
// FILE: src/routes/properties.js
// Property listing routes — CRUD with image uploads
// ============================================================

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabase");
const { requireAuth, requireRole } = require("../middleware/auth");
const { uploadPropertyImages } = require("../middleware/upload");
const crypto = require("crypto");

// Hardcoded areas for validation
const VALID_AREAS = [
  "New Bus Stand", "Old Bus Stand", "Millerpuram", "3rd Mile",
  "Bryant Nagar", "Therespuram", "Harbour Area", "SPIC Nagar",
  "Kattur", "VOC Nagar",
];

const VALID_TYPES = ["1BHK", "2BHK", "3BHK", "Single Room", "Shop"];
const VALID_FURNISHED = ["furnished", "semi", "unfurnished"];
const VALID_TENANT_TYPES = ["family", "bachelor", "any"];
const VALID_STATUSES = ["available", "occupied"];

/**
 * GET /api/properties
 * Fetch properties with filters and pagination.
 * Query params: area, minRent, maxRent, type, furnished, tenant_type, status, page, limit
 * No auth required — public route
 */
router.get("/", async (req, res) => {
  const {
    area,
    minRent,
    maxRent,
    type,
    furnished,
    tenant_type,
    status = "available",
    page = 1,
    limit = 20,
  } = req.query;

  // Build the query
  let query = supabaseAdmin
    .from("properties")
    .select("*, profiles!owner_id(name, phone)", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (area) query = query.eq("area", area);
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("type", type);
  if (furnished) query = query.eq("furnished", furnished);
  if (tenant_type) query = query.eq("tenant_type", tenant_type);
  if (minRent) query = query.gte("rent", parseInt(minRent));
  if (maxRent) query = query.lte("rent", parseInt(maxRent));

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: "Failed to fetch properties", details: error.message });
  }

  return res.json({
    properties: data || [],
    pagination: {
      page: pageNum,
      limit: pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasMore: to < (count || 0) - 1,
    },
  });
});

/**
 * GET /api/properties/count
 * Get count of available listings, optionally by area
 */
router.get("/count", async (req, res) => {
  const { area } = req.query;

  let query = supabaseAdmin
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("status", "available");

  if (area) query = query.eq("area", area);

  const { count, error } = await query;

  if (error) {
    return res.status(500).json({ error: "Failed to get count" });
  }

  return res.json({ count: count || 0 });
});

/**
 * GET /api/properties/mine
 * Get properties owned by the current user along with analytics
 * Auth: Owner JWT required
 */
router.get("/mine", requireAuth, requireRole("owner"), async (req, res) => {
  const { data: properties, error } = await supabaseAdmin
    .from("properties")
    .select(`
      *,
      property_views ( viewed_at ),
      contact_taps ( action, tapped_at )
    `)
    .eq("owner_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: "Failed to fetch your properties", details: error.message });
  }

  // Calculate analytics
  const enrichedProperties = properties.map(p => {
    // 7-day view sparkline (counts per day for the last 7 days)
    const viewSparkline = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    
    p.property_views.forEach(v => {
      const daysAgo = Math.floor((now - new Date(v.viewed_at)) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) {
        viewSparkline[6 - daysAgo]++;
      }
    });

    const callTaps = p.contact_taps.filter(t => t.action === 'call').length;
    const whatsappTaps = p.contact_taps.filter(t => t.action === 'whatsapp').length;
    const daysListed = Math.floor((now - new Date(p.created_at)) / (1000 * 60 * 60 * 24));

    const analytics = {
      totalViews: p.property_views.length,
      viewSparkline,
      callTaps,
      whatsappTaps,
      daysListed
    };

    delete p.property_views;
    delete p.contact_taps;

    return { ...p, analytics };
  });

  return res.json({ properties: enrichedProperties });
});

/**
 * GET /api/properties/:id
 * Get a single property by ID
 */
router.get("/:id", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("properties")
    .select("*, profiles!owner_id(name, phone)")
    .eq("id", req.params.id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Property not found" });
  }

  return res.json({ property: data });
});

/**
 * POST /api/properties/:id/view
 * Record a property view
 */
router.post("/:id/view", async (req, res) => {
  const viewerIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ipHash = crypto.createHash('sha256').update(viewerIp).digest('hex').substring(0, 16);

  const { error } = await supabaseAdmin
    .from("property_views")
    .insert({
      property_id: req.params.id,
      viewer_ip_hash: ipHash
    });

  if (error) console.error("View tracking error:", error);
  return res.status(200).json({ success: true });
});

/**
 * POST /api/properties/:id/tap
 * Record a contact tap (call/whatsapp)
 */
router.post("/:id/tap", async (req, res) => {
  const { action } = req.body;
  if (!['call', 'whatsapp'].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const { error } = await supabaseAdmin
    .from("contact_taps")
    .insert({
      property_id: req.params.id,
      action
    });

  if (error) console.error("Tap tracking error:", error);
  return res.status(200).json({ success: true });
});

/**
 * POST /api/properties

 * Create a new property listing with image uploads.
 * Auth: Owner JWT required
 */
router.post("/", requireAuth, requireRole("owner"), (req, res, next) => {
  // Wrap multer in error handling
  uploadPropertyImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: "Image upload failed",
        details: err.message,
      });
    }
    next();
  });
}, async (req, res) => {
  const { title, area, rent, type, furnished, tenant_type, phone, whatsapp } = req.body;

  // Validation
  const errors = [];
  if (!title) errors.push("title is required");
  if (!area || !VALID_AREAS.includes(area)) errors.push(`area must be one of: ${VALID_AREAS.join(", ")}`);
  if (!rent || isNaN(rent) || parseInt(rent) <= 0) errors.push("rent must be a positive number");
  if (type && !VALID_TYPES.includes(type)) errors.push(`type must be one of: ${VALID_TYPES.join(", ")}`);
  if (furnished && !VALID_FURNISHED.includes(furnished)) errors.push(`furnished must be one of: ${VALID_FURNISHED.join(", ")}`);
  if (tenant_type && !VALID_TENANT_TYPES.includes(tenant_type)) errors.push(`tenant_type must be one of: ${VALID_TENANT_TYPES.join(", ")}`);
  if (!phone) errors.push("phone is required");

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // Upload images to Supabase Storage
  const imageUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const fileName = `${req.user.id}/${crypto.randomUUID()}-${file.originalname}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("property-images")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        continue; // Skip failed uploads but don't block the listing
      }

      // Get the public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("property-images")
        .getPublicUrl(fileName);

      imageUrls.push(urlData.publicUrl);
    }
  }

  // Insert the property
  const { data: property, error } = await supabaseAdmin
    .from("properties")
    .insert({
      title,
      area,
      rent: parseInt(rent),
      type: type || null,
      furnished: furnished || null,
      tenant_type: tenant_type || null,
      phone,
      whatsapp: whatsapp || phone, // Default WhatsApp to phone if not provided
      images: imageUrls,
      owner_id: req.user.id,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to create property", details: error.message });
  }

  return res.status(201).json({
    message: "Property listed successfully",
    property,
  });
});

/**
 * PATCH /api/properties/:id/status
 * Update property status (available/occupied)
 * Auth: Owner JWT (must be the owner of this property)
 */
router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from("properties")
    .select("owner_id")
    .eq("id", req.params.id)
    .single();

  if (!existing) {
    return res.status(404).json({ error: "Property not found" });
  }

  if (existing.owner_id !== req.user.id) {
    return res.status(403).json({ error: "You can only update your own properties" });
  }

  // Update the status
  const { data: updated, error } = await supabaseAdmin
    .from("properties")
    .update({ status })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to update status", details: error.message });
  }

  return res.json({
    message: `Property marked as ${status}`,
    property: updated,
  });
});

/**
 * DELETE /api/properties/:id
 * Delete a property listing
 * Auth: Owner JWT (must be the owner)
 */
router.delete("/:id", requireAuth, requireRole("owner"), async (req, res) => {
  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from("properties")
    .select("owner_id")
    .eq("id", req.params.id)
    .single();

  if (!existing) {
    return res.status(404).json({ error: "Property not found" });
  }

  if (existing.owner_id !== req.user.id) {
    return res.status(403).json({ error: "You can only delete your own properties" });
  }

  const { error } = await supabaseAdmin
    .from("properties")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ error: "Failed to delete property", details: error.message });
  }

  return res.json({ message: "Property deleted successfully" });
});

/**
 * POST /api/properties/:id/promote
 * Owner requests a promotion plan for their listing
 * Body: { plan: '3day_boost' | 'homepage_feature' }
 */
router.post("/:id/promote", requireAuth, requireRole("owner"), async (req, res) => {
  const { plan } = req.body;
  const PLANS = {
    '3day_boost':       { label: '3-Day Boost', price: 99,  days: 3 },
    'homepage_feature': { label: 'Homepage Feature', price: 199, days: 7 },
  };

  if (!plan || !PLANS[plan]) {
    return res.status(400).json({ error: "Invalid plan. Choose '3day_boost' or 'homepage_feature'" });
  }

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from("properties")
    .select("owner_id, title, area")
    .eq("id", req.params.id)
    .single();

  if (!existing) return res.status(404).json({ error: "Property not found" });
  if (existing.owner_id !== req.user.id) return res.status(403).json({ error: "You can only promote your own properties" });

  // Log as admin_log entry for admin to action
  await supabaseAdmin.from("admin_logs").insert({
    admin_id: req.user.id,
    action: "promote_request",
    target_type: "property",
    target_id: req.params.id,
    meta: { plan, planLabel: PLANS[plan].label, price: PLANS[plan].price, title: existing.title, area: existing.area },
  });

  return res.status(201).json({
    message: `Promotion request sent! Admin will activate your ${PLANS[plan].label} within 24 hours.`,
    plan: PLANS[plan],
  });
});

/**
 * GET /api/properties/area-demand/:area
 * Returns demand score for an area based on total listings activity
 */
router.get("/area-demand/:area", async (req, res) => {
  const { area } = req.params;

  const [viewsRes, tapsRes, listingsRes] = await Promise.all([
    supabaseAdmin
      .from("property_views")
      .select("property_id", { count: "exact", head: true })
      .gte("viewed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin
      .from("contact_taps")
      .select("property_id", { count: "exact", head: true })
      .gte("tapped_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("area", area)
      .eq("status", "available"),
  ]);

  const weeklyViews = viewsRes.count || 0;
  const weeklyTaps  = tapsRes.count  || 0;
  const activeListings = listingsRes.count || 0;

  // Simple demand score: views*1 + taps*3, normalised to 100, capped
  const rawScore = Math.min(weeklyViews * 1 + weeklyTaps * 3, 200);
  const score = Math.round((rawScore / 200) * 100);

  let label = "Low";
  let emoji = "🟡";
  if (score >= 70) { label = "Very High"; emoji = "🔥"; }
  else if (score >= 45) { label = "High"; emoji = "📈"; }
  else if (score >= 20) { label = "Moderate"; emoji = "🟢"; }

  return res.json({ area, score, label, emoji, weeklyViews, weeklyTaps, activeListings });
});

/**
 * GET /api/properties/owner/trust-score
 * Calculates a trust score (0–100) for the authenticated owner.
 * Auth: Owner JWT required
 */
router.get("/owner/trust-score", requireAuth, requireRole("owner"), async (req, res) => {
  const ownerId = req.user.id;

  const [profileRes, propertiesRes, viewsRes, tapsRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("phone, created_at").eq("id", ownerId).single(),
    supabaseAdmin.from("properties").select("id, status, created_at").eq("owner_id", ownerId),
    supabaseAdmin
      .from("property_views")
      .select("property_id", { count: "exact", head: true })
      .in("property_id", (await supabaseAdmin.from("properties").select("id").eq("owner_id", ownerId)).data?.map(p => p.id) || []),
    supabaseAdmin
      .from("contact_taps")
      .select("property_id", { count: "exact", head: true })
      .in("property_id", (await supabaseAdmin.from("properties").select("id").eq("owner_id", ownerId)).data?.map(p => p.id) || []),
  ]);

  const profile = profileRes.data || {};
  const properties = propertiesRes.data || [];

  // Score components
  let score = 0;
  const breakdown = [];

  // 1. Verified phone (30 pts)
  if (profile.phone && profile.phone.length >= 10) {
    score += 30;
    breakdown.push({ label: "Phone Verified", pts: 30, done: true });
  } else {
    breakdown.push({ label: "Phone Verified", pts: 30, done: false });
  }

  // 2. Has active listings (20 pts)
  const activeCount = properties.filter(p => p.status === "available").length;
  if (activeCount > 0) {
    score += Math.min(20, activeCount * 10);
    breakdown.push({ label: "Active Listings", pts: Math.min(20, activeCount * 10), done: true });
  } else {
    breakdown.push({ label: "Active Listings", pts: 20, done: false });
  }

  // 3. Account age (20 pts — 1pt per week, max 20)
  const ageWeeks = profile.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at)) / (7 * 24 * 60 * 60 * 1000))
    : 0;
  const agePts = Math.min(20, ageWeeks);
  score += agePts;
  breakdown.push({ label: "Account Age", pts: agePts, done: agePts > 0 });

  // 4. Engagement — views (20 pts)
  const totalViews = viewsRes.count || 0;
  const viewPts = Math.min(20, Math.floor(totalViews / 2));
  score += viewPts;
  breakdown.push({ label: "Listing Views", pts: viewPts, done: viewPts > 0 });

  // 5. Contacts (10 pts)
  const totalTaps = tapsRes.count || 0;
  const tapPts = Math.min(10, totalTaps * 2);
  score += tapPts;
  breakdown.push({ label: "Contact Activity", pts: tapPts, done: tapPts > 0 });

  return res.json({ score: Math.min(100, score), breakdown, totalListings: properties.length, activeListings: activeCount });
});

/**
 * POST /api/properties/owner/issue
 * Owner submits an issue/support request to admin
 * Body: { type: 'report_issue'|'contact_admin'|'promote_request', message, property_id? }
 */
router.post("/owner/issue", requireAuth, requireRole("owner"), async (req, res) => {
  const { type, message, property_id } = req.body;
  const VALID_TYPES = ["report_issue", "contact_admin", "request_promotion"];

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` });
  }
  if (!message || message.trim().length < 5) {
    return res.status(400).json({ error: "message must be at least 5 characters" });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles").select("name, phone").eq("id", req.user.id).single();

  await supabaseAdmin.from("admin_logs").insert({
    admin_id: req.user.id,
    action: type,
    target_type: "owner_request",
    target_id: property_id || null,
    meta: { message: message.trim(), ownerName: profile?.name, ownerPhone: profile?.phone },
  });

  return res.status(201).json({ message: "Your request has been sent to admin. We'll respond within 24 hours." });
});

module.exports = router;
