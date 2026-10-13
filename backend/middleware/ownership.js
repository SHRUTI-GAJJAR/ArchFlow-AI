const Communication = require("../models/Communication");

// Single source of truth for "does this user own this communication".
// Previously duplicated across communicationController and aiController.
const loadCommunicationForOwner = async (communicationId, userId) => {
  const communication = await Communication.findById(communicationId).populate(
    "project",
    "name owner"
  );

  if (!communication) {
    return { error: { status: 404, message: "Communication not found" } };
  }

  const ownerId = communication.project?.owner;

  if (!ownerId || ownerId.toString() !== userId.toString()) {
    return {
      error: {
        status: 403,
        message: "Not authorized to access this communication",
      },
    };
  }

  return { communication };
};

module.exports = { loadCommunicationForOwner };