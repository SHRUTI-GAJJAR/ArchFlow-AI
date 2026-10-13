const mongoose = require("mongoose");

// Guards routes that take an :id parameter so a malformed value returns a
// clean 400 instead of a Mongoose CastError bubbling up as a 500.
const validateObjectId = (paramName = "id") => (req, res, next) => {
  const value = req.params[paramName];

  if (!value || !mongoose.isValidObjectId(value)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName}. Expected a valid identifier.`,
    });
  }

  next();
};

module.exports = validateObjectId;