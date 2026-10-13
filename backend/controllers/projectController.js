const Project = require("../models/Project");
const Communication = require("../models/Communication");
const AIInsight = require("../models/AIInsight");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Create project
const createProject = asyncHandler(async (req, res) => {
  const { name, description, clientName, status } = req.body;

  if (!name) {
    throw ApiError.badRequest("Project name is required");
  }

  const project = await Project.create({
    name,
    description,
    clientName,
    status,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    project,
  });
});

// Get all projects of logged-in user
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    owner: req.user._id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    projects,
  });
});

// Get single project
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!project) {
    throw ApiError.notFound("Project not found");
  }

  res.status(200).json({
    success: true,
    project,
  });
});

// Update project
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, clientName, status } = req.body;

  const updates = {};

  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (clientName !== undefined) updates.clientName = clientName;
  if (status !== undefined) updates.status = status;

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest("Nothing to update");
  }

  const project = await Project.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user._id,
    },
    updates,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!project) {
    throw ApiError.notFound("Project not found");
  }

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    project,
  });
});

// Delete project (cascades to communications and their AI insights)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!project) {
    throw ApiError.notFound("Project not found");
  }

  // Cascade delete so orphaned documents never accumulate.
  const communications = await Communication.find({ project: project._id }).select(
    "_id"
  );

  const communicationIds = communications.map((doc) => doc._id);

  if (communicationIds.length > 0) {
    await Communication.deleteMany({ _id: { $in: communicationIds } });
    await AIInsight.deleteMany({ communication: { $in: communicationIds } });
  }

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
    deletedCommunications: communicationIds.length,
  });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};