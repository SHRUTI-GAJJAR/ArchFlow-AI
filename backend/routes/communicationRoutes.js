const express = require("express");

const {
  createCommunication,
  getCommunications,
  getCommunicationById,
  updateCommunication,
  deleteCommunication,
} = require("../controllers/communicationController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

// Create communication
router.post("/", protect, createCommunication);

// Get all communications for a project
router.get(
  "/project/:projectId",
  protect,
  validateObjectId("projectId"),
  getCommunications
);

// Get one communication
router.get("/:id", protect, validateObjectId("id"), getCommunicationById);

// Update communication
router.patch("/:id", protect, validateObjectId("id"), updateCommunication);

// Delete communication
router.delete("/:id", protect, validateObjectId("id"), deleteCommunication);

module.exports = router;