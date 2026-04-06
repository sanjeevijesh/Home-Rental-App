// ============================================================
// FILE: src/index.js  (updated — adds /api/admin routes)
// Main Express.js server entry point
// ============================================================

require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");

const app = express();

console.log("🌍 ENV CHECK:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "Loaded ✅" : "Missing ❌");
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────
const authRoutes         = require("./routes/auth");
const propertyRoutes     = require("./routes/properties");
const scoutRoutes        = require("./routes/scouts");
const userRoutes         = require("./routes/users");
const notificationRoutes = require("./routes/notifications");
const adminRoutes        = require("./routes/admin");   // ← NEW

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "NearbyRental API", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth",          authRoutes);
app.use("/api/properties",    propertyRoutes);
app.use("/api/scouts",        scoutRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin",         adminRoutes);             // ← NEW

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

// ── Error Handler ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("❌ Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
  console.log(`🌐 CORS allowed: ${process.env.CORS_ORIGIN || "*"}`);
}); 
