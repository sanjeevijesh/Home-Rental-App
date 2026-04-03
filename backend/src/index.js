// ============================================================
// FILE: src/index.js
// Main Express.js server entry point
// ============================================================

require("dotenv").config();
require("express-async-errors"); // Patch express to handle async errors

const express = require("express");
const cors = require("cors");

// Route imports
const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");
const scoutRoutes = require("./routes/scouts");
const userRoutes = require("./routes/users");
const notificationRoutes = require("./routes/notifications");

const app = express();

// ── Global middleware ──────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "NearbyRental API", timestamp: new Date().toISOString() });
});

// ── API routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/scouts", scoutRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

// ── Global error handler ───────────────────────────────────
// express-async-errors ensures async errors are caught here
app.use((err, req, res, _next) => {
  console.error("❌ Unhandled error:", err);

  // Supabase errors often have a `message` and `status`
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ── Start server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 NearbyRental API running on http://localhost:${PORT}`);
  console.log(`   CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
});
