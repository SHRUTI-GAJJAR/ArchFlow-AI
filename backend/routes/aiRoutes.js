const express = require("express");

const {
  analyzeCommunicationController,
  getAIInsight,
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Analyze a communication
router.post(
  "/analyze/:communicationId",
  protect,
  analyzeCommunicationController
);

// Get saved AI insight
router.get(
  "/insight/:communicationId",
  protect,
  getAIInsight
);

module.exports = router;