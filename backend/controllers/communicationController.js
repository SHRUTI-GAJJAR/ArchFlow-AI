const Communication = require("../models/Communication");
const Project = require("../models/Project");
const AIInsight = require("../models/AIInsight");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { loadCommunicationForOwner } = require("../middleware/ownership");

// Create communication
const createCommunication = asyncHandler(async (req, res) => {
  const { project, title, source, content, participants } = req.body;

  if (!project || !title || !content) {
    throw ApiError.badRequest("Project, title and content are required");
  }

  const existingProject = await Project.findOne({
    _id: project,
    owner: req.user._id,
  });

  if (!existingProject) {
    throw ApiError.notFound("Project not found");
  }

  const communication = await Communication.create({
    project,
    title,
    source,
    content,
    participants,
  });

  res.status(201).json({
    success: true,
    message: "Communication created successfully",
    communication,
  });
});

// Get all communications for a project
const getCommunications = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const existingProject = await Project.findOne({
    _id: projectId,
    owner: req.user._id,
  });

  if (!existingProject) {
    throw ApiError.notFound("Project not found");
  }

  const communications = await Communication.find({
    project: projectId,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    communications,
  });
});

// Get one communication
const getCommunicationById = asyncHandler(async (req, res) => {
  const { communication, error } = await loadCommunicationForOwner(
    req.params.id,
    req.user._id
  );

  if (error) {
    throw ApiError.from(error.status, error.message);
  }

  res.status(200).json({
    success: true,
    communication,
  });
});

// Update communication
const updateCommunication = asyncHandler(async (req, res) => {
  const { title, source, content, participants } = req.body;

  const { communication, error } = await loadCommunicationForOwner(
    req.params.id,
    req.user._id
  );

  if (error) {
    throw ApiError.from(error.status, error.message);
  }

  // A saved insight describes specific text. If that text changes, the old
  // insight is no longer accurate, so it is removed rather than left stale.
  const contentChanged = content !== undefined && content !== communication.content;

  if (title !== undefined) communication.title = title;
  if (source !== undefined) communication.source = source;
  if (content !== undefined) communication.content = content;
  if (participants !== undefined) communication.participants = participants;

  await communication.save();

  let insightInvalidated = false;

  if (contentChanged) {
    const result = await AIInsight.deleteOne({
      communication: communication._id,
    });

    insightInvalidated = result.deletedCount > 0;
  }

  res.status(200).json({
    success: true,
    message: "Communication updated successfully",
    insightInvalidated,
    communication,
  });
});

// Delete communication (cascades to its AI insight)
const deleteCommunication = asyncHandler(async (req, res) => {
  const { communication, error } = await loadCommunicationForOwner(
    req.params.id,
    req.user._id
  );

  if (error) {
    throw ApiError.from(error.status, error.message);
  }

  await communication.deleteOne();

  await AIInsight.deleteOne({ communication: communication._id });

  res.status(200).json({
    success: true,
    message: "Communication deleted successfully",
  });
});

module.exports = {
  createCommunication,
  getCommunications,
  getCommunicationById,
  updateCommunication,
  deleteCommunication,
};