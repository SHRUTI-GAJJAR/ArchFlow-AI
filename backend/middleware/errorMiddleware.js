const ApiError = require("../utils/ApiError");

// Terminal handler for unmatched routes.
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error formatter. Only messages from ApiError (and explicitly
// allow-listed Mongoose errors) reach the client; everything else is
// logged server-side and replaced with a generic 500 so internal details
// such as stack traces or DB connection strings are never leaked.
//
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Something went wrong";
  let details;

  // Mongoose validation / bad ObjectId -> client error, safe to surface.
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field "${err.path}".`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists.";
    details = Object.keys(err.keyValue || {});
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request payload is too large.";
  } else if (!err.isOperational) {
    // Unexpected error: keep the real message server-side only.
    statusCode = 500;
    message = "Internal server error.";
  }

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  } else {
    console.warn(`[warn] ${req.method} ${req.originalUrl} ${statusCode} - ${err.message}`);
  }

  const body = {
    success: false,
    message,
  };

  if (details) {
    body.details = details;
  }

  // Stack traces are a development aid only.
  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = { notFoundHandler, errorHandler };