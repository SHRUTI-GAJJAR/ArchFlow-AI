const express = require("express");

const {
  createCommunication,
  getCommunications,
  getCommunicationById,
  updateCommunication,
  deleteCommunication,
} = require("../controllers/communicationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create communication
router.post("/", protect, createCommunication);

// Get all communications for a project
router.get("/project/:projectId", protect, getCommunications);

// Get one communication
router.get("/:id", protect, getCommunicationById);

// Update communication
router.patch("/:id", protect, updateCommunication);

// Delete communication
router.delete("/:id", protect, deleteCommunication);

module.exports = router;