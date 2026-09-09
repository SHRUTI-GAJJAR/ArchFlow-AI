const Communication = require("../models/Communication");
const AIInsight = require("../models/AIInsight");
const { analyzeCommunication } = require("../services/aiService");


// Analyze communication
const analyzeCommunicationController = async (req, res) => {
  try {
    const { communicationId } = req.params;

    const communication = await Communication.findById(
      communicationId
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
        message: "Not authorized to analyze this communication",
      });
    }

    const aiResponse = await analyzeCommunication(
      communication.content
    );

    const parsedResponse = JSON.parse(aiResponse);

    const insight = await AIInsight.findOneAndUpdate(
      {
        communication: communicationId,
      },
      {
        communication: communicationId,
        summary: parsedResponse.summary || "",
        decisions: parsedResponse.decisions || [],
        actionItems: parsedResponse.actionItems || [],
        deadlines: parsedResponse.deadlines || [],
        peopleInvolved: parsedResponse.peopleInvolved || [],
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Communication analyzed successfully",
      insight,
    });
  } catch (error) {
    console.error("Communication analysis error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to analyze communication",
      error: error.message,
    });
  }
};

// Get AI insight for a communication
const getAIInsight = async (req, res) => {
  try {
    const { communicationId } = req.params;

    const communication = await Communication.findById(
      communicationId
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
        message: "Not authorized to access this insight",
      });
    }

    const insight = await AIInsight.findOne({
      communication: communicationId,
    });

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "AI insight not found",
      });
    }

    res.status(200).json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error("Get AI insight error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch AI insight",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeCommunicationController,
  getAIInsight,
};