const Movie = require("../models/Movie.model");
const cloudinary = require("../config/cloudinary");

/**
 * Helper Function — uploadToCloudinary
 * --------------------------------------
 * Takes the file buffer (from multer memory storage) and uploads it to Cloudinary.
 * Returns the secure URL and public_id of the uploaded image.
 *
 * Why upload_stream?
 *   Multer stores the file in memory as a Buffer (not a file path).
 *   Cloudinary's upload_stream accepts a stream/buffer directly,
 *   so we wrap the buffer in a readable stream and pipe it to Cloudinary.
 *
 * @param {Buffer} buffer  - The image file buffer from req.file.buffer
 * @param {String} folder  - The Cloudinary folder to upload into
 * @returns {Promise}      - Resolves with { secure_url, public_id }
 */
const uploadToCloudinary = (buffer, folder = "moviesfreak/posters") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,                    // organises uploads inside Cloudinary
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [
          { width: 500, height: 750, crop: "fill" }, // standard movie poster size
          { quality: "auto" },                        // auto-optimize quality
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); // result.secure_url + result.public_id
      }
    );

    // Convert buffer to a readable stream and pipe into Cloudinary
    const { Readable } = require("stream");
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // signals end of stream
    readable.pipe(uploadStream);
  });
};

/**
 * Helper Function — extractPublicId
 * -----------------------------------
 * Extracts the Cloudinary public_id from a stored Cloudinary URL.
 * Needed when we want to delete an old image before uploading a new one.
 *
 * Example URL: https://res.cloudinary.com/cloud/image/upload/v123/moviesfreak/posters/abc.jpg
 * Extracted:   moviesfreak/posters/abc
 *
 * @param {String} url - The full Cloudinary secure URL
 * @returns {String}   - The public_id (folder/filename without extension)
 */
const extractPublicId = (url) => {
  // Split by "/upload/" to get everything after it
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;

  // Remove the version prefix (v1234567/) if present, then remove file extension
  const afterUpload = parts[1].replace(/^v\d+\//, "");
  const publicId = afterUpload.replace(/\.[^/.]+$/, ""); // remove extension
  return publicId;
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/movies
 * @desc    Admin — Create a new movie
 * @access  Protected + Admin only
 *
 * Request: multipart/form-data with fields:
 *   title, movieId, description, releaseDate, trailerUrl, genre, category
 *   poster (file) — image uploaded to Cloudinary
 */
const createMovie = async (req, res, next) => {
  try {
    const { title, movieId, description, releaseDate, trailerUrl, genre, category } = req.body;

    // Step 1: Validate required fields
    if (!title || !movieId) {
      return res.status(400).json({
        success: false,
        message: "Movie title and movieId are required.",
      });
    }

    // Step 2: Check for duplicate movieId
    const existing = await Movie.findOne({ movieId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A movie with this movieId already exists.",
      });
    }

    // Step 3: Upload poster image to Cloudinary (if a file was provided)
    let posterUrl = undefined; // will fall back to model default if not provided

    if (req.file) {
      // req.file.buffer is the image in memory — upload it to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      posterUrl = cloudinaryResult.secure_url; // permanent hosted URL
    }

    // Step 4: Create the movie — poster uses Cloudinary URL or model default placeholder
    const movie = await Movie.create({
      title,
      movieId,
      poster: posterUrl,  // undefined here triggers the model default placeholder
      description,
      releaseDate,
      trailerUrl,
      genre,
      category,
    });

    res.status(201).json({
      success: true,
      message: "Movie created successfully.",
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/movies
 * @desc    Get all admin-managed movies (paginated)
 * @access  Protected (any logged-in user)
 *
 * Query params: ?page=1&limit=10
 * Returns newest movies first.
 */
const getAllMovies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const movies = await Movie.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMovies = await Movie.countDocuments();

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalMovies / limit),
      totalMovies,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/movies/:id
 * @desc    Get a single movie by MongoDB _id
 * @access  Protected (any logged-in user)
 */
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   PUT /api/movies/:id
 * @desc    Admin — Update a movie's details
 * @access  Protected + Admin only
 *
 * If a new poster file is uploaded:
 *   1. Old Cloudinary image is deleted (Option A — clean storage)
 *   2. New image is uploaded to Cloudinary
 *   3. New URL replaces the old one in the DB
 */
const updateMovie = async (req, res, next) => {
  try {
    // Step 1: Find the existing movie first (needed for old poster deletion)
    const existingMovie = await Movie.findById(req.params.id);

    if (!existingMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    // Step 2: If a new poster image was uploaded, handle Cloudinary replacement
    if (req.file) {
      // DELETE the old Cloudinary image (Option A — no wasted storage)
      const oldPosterUrl = existingMovie.poster;

      // Only attempt deletion if the current poster is a Cloudinary URL
      if (oldPosterUrl && oldPosterUrl.includes("cloudinary.com")) {
        const publicId = extractPublicId(oldPosterUrl);
        if (publicId) {
          // Destroy the old image on Cloudinary
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // UPLOAD the new image to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      req.body.poster = cloudinaryResult.secure_url; // add new URL to the update body
    }

    // Step 3: Update the movie document with the new fields
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // return updated document
        runValidators: true, // re-run schema validators
      }
    );

    res.status(200).json({
      success: true,
      message: "Movie updated successfully.",
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   DELETE /api/movies/:id
 * @desc    Admin — Delete a movie permanently
 * @access  Protected + Admin only
 *
 * Also deletes the movie's poster from Cloudinary if it was uploaded there.
 */
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    // Delete the poster from Cloudinary if it's a Cloudinary-hosted image
    if (movie.poster && movie.poster.includes("cloudinary.com")) {
      const publicId = extractPublicId(movie.poster);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Delete the movie from MongoDB
    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Movie and its poster deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMovie, getAllMovies, getMovieById, updateMovie, deleteMovie };
