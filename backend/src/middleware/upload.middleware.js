const multer = require("multer");

/**
 * Multer Upload Middleware
 * ------------------------
 * Multer is a middleware that handles multipart/form-data requests
 * (i.e., requests that include a file upload from the browser).
 *
 * We use MEMORY storage — the file is NOT saved to disk.
 * Instead it's stored as a Buffer in memory (req.file.buffer).
 * We then pass this buffer directly to Cloudinary for uploading.
 *
 * Why memory storage?
 *   - Avoids creating temporary files on the server
 *   - Cleaner and faster for cloud uploads
 *   - No cleanup required after upload
 */
const storage = multer.memoryStorage();

/**
 * File Filter
 * -----------
 * Only allow image files (JPEG, PNG, WebP, GIF).
 * Rejects any other file type with a clear error message.
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error("Only image files (JPEG, PNG, WebP, GIF) are allowed."), false);
  }
};

/**
 * Upload Middleware Instance
 * --------------------------
 * Max file size: 5MB (5 * 1024 * 1024 bytes)
 * Field name expected from the frontend form: "poster"
 * (The <input type="file" name="poster" /> must match this)
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

module.exports = upload;
