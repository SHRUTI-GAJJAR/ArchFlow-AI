const mongoose = require("mongoose");
const AIInsight = require("../models/AIInsight");
const Communication = require("../models/Communication");
const Project = require("../models/Project");
const { analyzeCommunication } = require("../services/aiService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { loadCommunicationForOwner } = require("../middleware/ownership");

// Analyze communication
const analyzeCommunicationController = asyncHandler(async (req, res) => {
  const { communicationId } = req.params;

  const { communication, error } = await loadCommunicationForOwner(
    communicationId,
    req.user._id
  );

  if (error) {
    throw ApiError.from(error.status, error.message);
  }

  // analyzeCommunication now returns a validated, schema-shaped object and
  // retries malformed or transient upstream failures internally.
  const parsedResponse = await analyzeCommunication(communication.content);

  const insight = await AIInsight.findOneAndUpdate(
    {
      communication: communication._id,
    },
    {
      communication: communication._id,
      ...parsedResponse,
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Communication analyzed successfully",
    insight,
  });
});

// Get AI insight for a communication
const getAIInsight = asyncHandler(async (req, res) => {
  const { communicationId } = req.params;

  const { error } = await loadCommunicationForOwner(
    communicationId,
    req.user._id
  );

  if (error) {
    throw ApiError.from(error.status, error.message);
  }

  const insight = await AIInsight.findOne({
    communication: communicationId,
  });

  if (!insight) {
    throw ApiError.notFound("AI insight not found");
  }

  res.status(200).json({
    success: true,
    insight,
  });
});

// Get many insights in one request.
//
// The project details page previously fetched insights one at a time in a
// sequential loop (N+1 round trips). This endpoint returns the same data in
// a single call, keyed by communication id.
const getInsightsBatch = asyncHandler(async (req, res) => {
  const communicationIds = Array.isArray(req.body?.communicationIds)
    ? req.body.communicationIds
    : [];

  if (communicationIds.length === 0) {
    throw ApiError.badRequest("communicationIds must be a non-empty array");
  }

  if (communicationIds.length > 200) {
    throw ApiError.badRequest("A maximum of 200 communicationIds per request");
  }

  // Only ids that are valid ObjectIds and owned by the caller may be read.
  const safeIds = communicationIds.filter(
    (id) => typeof id === "string" && mongoose.isValidObjectId(id)
  );

  if (safeIds.length === 0) {
    return res.status(200).json({
      success: true,
      insights: {},
    });
  }

  const ownedCommunications = await Communication.find({
    _id: { $in: safeIds },
  }).populate("project", "owner").select("_id project");

  const ownedIds = new Set(
    ownedCommunications
      .filter(
        (doc) => doc.project?.owner?.toString() === req.user._id.toString()
      )
      .map((doc) => doc._id.toString())
  );

  const insights = await AIInsight.find({
    communication: { $in: [...ownedIds] },
  }).select(
    "communication summary decisions actionItems deadlines peopleInvolved"
  );

  // Missing ids are simply absent from the map, which the client treats as
  // "no insight yet".
  const insightMap = {};
  insights.forEach((insight) => {
    insightMap[insight.communication.toString()] = insight;
  });

  res.status(200).json({
    success: true,
    insights: insightMap,
  });
});

// Aggregate counts for the dashboard, scoped to the caller's projects.
// The dashboard previously rendered a hardcoded dash for "Action items".
const getInsightSummary = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user._id }).select("_id");

  const projectIds = projects.map((project) => project._id);

  if (projectIds.length === 0) {
    return res.status(200).json({
      success: true,
      summary: {
        analyzedCommunications: 0,
        totalActionItems: 0,
        pendingActionItems: 0,
        completedActionItems: 0,
        upcomingDeadlines: 0,
      },
    });
  }

  const communications = await Communication.find({
    project: { $in: projectIds },
  }).select("_id");

  const communicationIds = communications.map((doc) => doc._id);

  const [stats] = await AIInsight.aggregate([
    { $match: { communication: { $in: communicationIds } } },
    {
      $project: {
        totalActionItems: { $size: { $ifNull: ["$actionItems", []] } },
        pendingActionItems: {
          $size: {
            $filter: {
              input: { $ifNull: ["$actionItems", []] },
              as: "item",
              cond: { $ne: ["$$item.status", "completed"] },
            },
          },
        },
        completedActionItems: {
          $size: {
            $filter: {
              input: { $ifNull: ["$actionItems", []] },
              as: "item",
              cond: { $eq: ["$$item.status", "completed"] },
            },
          },
        },
        totalDeadlines: { $size: { $ifNull: ["$deadlines", []] } },
      },
    },
    {
      $group: {
        _id: null,
        analyzedCommunications: { $sum: 1 },
        totalActionItems: { $sum: "$totalActionItems" },
        pendingActionItems: { $sum: "$pendingActionItems" },
        completedActionItems: { $sum: "$completedActionItems" },
        totalDeadlines: { $sum: "$totalDeadlines" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    summary: {
      analyzedCommunications: stats?.analyzedCommunications || 0,
      totalActionItems: stats?.totalActionItems || 0,
      pendingActionItems: stats?.pendingActionItems || 0,
      completedActionItems: stats?.completedActionItems || 0,
      upcomingDeadlines: stats?.totalDeadlines || 0,
    },
  });
});

module.exports = {
  analyzeCommunicationController,
  getAIInsight,
  getInsightsBatch,
  getInsightSummary,
};