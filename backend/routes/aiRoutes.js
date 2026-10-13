const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  analyzeCommunicationController,
  getAIInsight,
  getInsightsBatch,
  getInsightSummary,
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

// Capped tightly to protect the provider's quota.
//
// On the Groq free tier the limit is shared across the whole organisation
// (~30 req/min, ~1,000 req/day on gpt-oss-120b), so this is set to 10/min
// per caller: low enough that a handful of concurrent users cannot exhaust
// the org budget, high enough to be usable.
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "AI analysis limit reached. Please wait a minute before trying again.",
  },
});

// Fetch insights for many communications in a single request.
router.post("/insights/batch", protect, getInsightsBatch);

// Aggregate insight counts for the dashboard.
router.get("/insights/summary", protect, getInsightSummary);

// Analyze a communication
router.post(
  "/analyze/:communicationId",
  protect,
  analyzeLimiter,
  validateObjectId("communicationId"),
  analyzeCommunicationController
);

// Get saved AI insight
router.get(
  "/insight/:communicationId",
  protect,
  validateObjectId("communicationId"),
  getAIInsight
);

module.exports = router;