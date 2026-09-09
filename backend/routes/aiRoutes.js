const express = require("express");

const {
  testAIConnection,
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", protect, testAIConnection);

module.exports = router;