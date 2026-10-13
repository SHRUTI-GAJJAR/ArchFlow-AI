/**
 * Dev-only helper: inserts a demo AIInsight for a communication so the
 * insight panel can be exercised without calling the AI provider.
 *
 * Usage:
 *   node scripts/seed-insight.js <communicationId>
 */
// Resolve .env relative to the backend root, not the current working
// directory, so this script works when invoked from anywhere.
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");
const Communication = require("../models/Communication");
const AIInsight = require("../models/AIInsight");

const communicationId = process.argv[2];

if (!communicationId) {
  console.error("Usage: node scripts/seed-insight.js <communicationId>");
  process.exit(1);
}

/**
 * Demo insight for the ground-floor strip-out note.
 *
 * Deliberately carries no invented deadlines: none were mentioned in the
 * source communication, so none appear here. That is the product's core
 * claim, and a demo that fakes a date would undercut it.
 */
const DEMO_INSIGHT = {
  summary:
    "Ground floor strip-out is complete. The existing joists were found to be boxed rather than solid, which changes the floor build-up. The acoustic upgrade is to be priced separately, and written confirmation that the flagstones have been salvaged is still outstanding.",
  decisions: [
    "Ground floor strip-out signed off as complete",
    "Acoustic floor upgrade to be priced as a separate item",
  ],
  actionItems: [
    {
      task: "Price the acoustic floor upgrade as a separate item",
      assignee: "Hale & Sons",
      deadline: "",
      status: "pending",
    },
    {
      task: "Confirm in writing that the flagstones have been salvaged and stacked",
      assignee: "Hale & Sons",
      deadline: "",
      status: "pending",
    },
  ],
  // No dates were stated in the source conversation, so none are invented.
  deadlines: [],
  peopleInvolved: ["Hale & Sons", "Priya Raman"],
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const communication = await Communication.findById(communicationId);

    if (!communication) {
      console.error("Communication not found:", communicationId);
      process.exit(1);
    }

    const insight = await AIInsight.findOneAndUpdate(
      { communication: communicationId },
      { communication: communicationId, ...DEMO_INSIGHT },
      { upsert: true, returnDocument: "after", runValidators: true }
    );

    console.log("Seeded insight for communication:", insight.communication.toString());
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();