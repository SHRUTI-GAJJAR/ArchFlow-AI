// Typed application error. Anything thrown as an ApiError is considered
// "expected" and its message is safe to send to the client.
// Everything else falls through to the generic 500 handler.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  // Build from a raw status/message pair, e.g. one returned by a helper
  // that reports access problems without owning an HTTP response.
  static from(statusCode, message) {
    return new ApiError(statusCode, message);
  }

  static badRequest(message = "Bad request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Not authorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Not authorized to access this resource") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = "Too many requests, please try again later") {
    return new ApiError(429, message);
  }

  static internal(message = "Something went wrong") {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;