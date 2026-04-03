// ============================================================
// FILE: src/middleware/upload.js
// Multer configuration for image uploads
// ============================================================

const multer = require("multer");

// Use memory storage — we'll upload the buffer directly to Supabase Storage
// This avoids writing temp files to disk (important for serverless/containers)
const storage = multer.memoryStorage();

// File filter: only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",  // Common on iPhones
    "image/heif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and HEIC are allowed.`), false);
  }
};

// Upload middleware for multiple property images (up to 5)
const uploadPropertyImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file (considerate of low-end phones)
    files: 5,                   // Max 5 images per property
  },
}).array("images", 5);

// Upload middleware for a single scout report image
const uploadScoutImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
}).single("image");

module.exports = { uploadPropertyImages, uploadScoutImage };
