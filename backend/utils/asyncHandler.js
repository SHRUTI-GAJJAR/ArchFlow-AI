// Wraps an async route handler so rejected promises are forwarded to the
// global error middleware instead of becoming unhandled rejections.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;