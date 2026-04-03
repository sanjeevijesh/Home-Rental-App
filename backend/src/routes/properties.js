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

module.exports = router;
