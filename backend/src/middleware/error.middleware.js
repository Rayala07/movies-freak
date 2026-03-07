/**
 * Global Error Handler Middleware
 * --------------------------------
 * This is the LAST middleware mounted in app.js.
 * Express automatically routes any error here when:
 *   1. A controller calls next(error)
 *   2. An async controller throws an uncaught error
 *
 * It catches all types of errors and sends a clean,
 * consistent JSON error response so the frontend never
 * receives an HTML error page or a server crash.
 *
 * How to use in a controller:
 *   try { ... } catch (error) { next(error); }
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error if no status code is set
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  /**
   * Handle Mongoose Validation Errors
   * Example: required field missing in a schema
   * err.name === "ValidationError"
   */
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Extract all validation error messages and join them into one string
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  /**
   * Handle MongoDB Duplicate Key Error
   * Example: registering with an email that already exists
   * err.code === 11000
   */
  if (err.code === 11000) {
    statusCode = 400;
    // Extract the field name that caused the duplicate
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists. Please use a different ${field}.`;
  }

  /**
   * Handle Invalid Mongoose ObjectId
   * Example: passing a malformed ID in a route like /movies/abc
   * err.name === "CastError"
   */
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // Send a consistent error response
  res.status(statusCode).json({
    success: false,
    message,
    // Only show the error stack trace in development — never in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
