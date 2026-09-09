const Communication = require("../models/Communication");
const Project = require("../models/Project");

// Create communication
const createCommunication = async (req, res) => {
  try {
    const { project, title, source, content, participants } = req.body;

    if (!project || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Project, title and content are required",
      });
    }

    const existingProject = await Project.findOne({
      _id: project,
      owner: req.user._id,
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create communication",
      error: error.message,
    });
  }
};

// Get all communications for a project
const getCommunications = async (req, res) => {
  try {
    const { projectId } = req.params;

    const existingProject = await Project.findOne({
      _id: projectId,
      owner: req.user._id,
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const communications = await Communication.find({
      project: projectId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      communications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch communications",
      error: error.message,
    });
  }
};

// Get one communication
const getCommunicationById = async (req, res) => {
  try {
    const communication = await Communication.findById(
      req.params.id
    ).populate("project");

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: "Communication not found",
      });
    }

    if (
      communication.project.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this communication",
      });
    }

    res.status(200).json({
      success: true,
      communication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch communication",
      error: error.message,
    });
  }
};

// Update communication
const updateCommunication = async (req, res) => {
  try {
    const { title, source, content, participants } = req.body;

    const communication = await Communication.findById(
      req.params.id
    ).populate("project");

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: "Communication not found",
      });
    }

    if (
      communication.project.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this communication",
      });
    }

    if (title !== undefined) communication.title = title;
    if (source !== undefined) communication.source = source;
    if (content !== undefined) communication.content = content;
    if (participants !== undefined) {
      communication.participants = participants;
    }

    await communication.save();

    res.status(200).json({
      success: true,
      message: "Communication updated successfully",
      communication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update communication",
      error: error.message,
    });
  }
};

// Delete communication
const deleteCommunication = async (req, res) => {
  try {
    const communication = await Communication.findById(
      req.params.id
    ).populate("project");

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: "Communication not found",
      });
    }

    if (
      communication.project.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this communication",
      });
    }

    await communication.deleteOne();

    res.status(200).json({
      success: true,
      message: "Communication deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete communication",
      error: error.message,
    });
  }
};

module.exports = {
  createCommunication,
  getCommunications,
  getCommunicationById,
  updateCommunication,
  deleteCommunication,
};