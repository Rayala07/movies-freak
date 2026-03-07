const cloudinary = require("cloudinary").v2;
require("dotenv").config();

/**
 * Cloudinary Configuration
 * ------------------------
 * Configures the Cloudinary SDK using credentials from .env
 * This file is imported wherever we need to upload or delete images.
 *
 * Cloudinary is a cloud-based image/video management service.
 * We use it to:
 *   - Upload movie poster images sent by the admin
 *   - Get back a permanent hosted URL to store in MongoDB
 *   - Delete old poster images when admin updates a movie
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
