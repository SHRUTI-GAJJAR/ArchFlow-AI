const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
} = require("../controllers/authController");

const router = express.Router();

// Throttles credential stuffing and mass account creation.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

module.exports = router;