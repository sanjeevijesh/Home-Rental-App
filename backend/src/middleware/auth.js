// ============================================================
// FILE: src/middleware/auth.js
// JWT authentication middleware using Supabase
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
    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Invalid or expired token",
        details: error?.message,
      });
    }

    // Attach user info to the request object
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Token verification failed",
      details: err.message,
    });
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
 * Usage: requireRole('owner') or requireRole('scout', 'owner')
 */
function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { supabaseAdmin } = require("../services/supabase");

    // Fetch the user's profile to check their role
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: "Profile not found" });
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
