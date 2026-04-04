// ============================================================
// FILE: src/middleware/auth.js  (updated)
// JWT authentication middleware — adds super_admin support
// ============================================================

const { supabase } = require("../services/supabase");

/**
 * Verify Supabase JWT from the Authorization header.
 * Attaches the authenticated user to req.user
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header",
      hint: 'Expected format: "Bearer <jwt_token>"',
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token", details: error?.message });
    }

    req.user  = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token verification failed", details: err.message });
  }
}

/**
 * Optional auth — continues even if no token is present,
 * but attaches user if a valid token exists.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    req.user = user || null;
  } catch {
    req.user = null;
  }

  next();
}

/**
 * Role-based authorization middleware factory.
 * super_admin always passes (can do anything).
 * Usage: requireRole('owner') or requireRole('scout', 'owner')
 */
function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { supabaseAdmin } = require("../services/supabase");

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("role, suspended")
      .eq("id", req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: "Profile not found" });
    }

    // Suspended users cannot do anything
    if (profile.suspended) {
      return res.status(403).json({ error: "Account suspended. Contact support." });
    }

    // super_admin can do everything — bypass role checks
    if (profile.role === "super_admin") {
      req.userRole = "super_admin";
      return next();
    }

    if (!roles.includes(profile.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(" or ")}`,
        yourRole: profile.role,
      });
    }

    req.userRole = profile.role;
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };