const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

// All project routes require authentication
router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, validateObjectId("id"), getProjectById);
router.patch("/:id", protect, validateObjectId("id"), updateProject);
router.delete("/:id", protect, validateObjectId("id"), deleteProject);

module.exports = router;