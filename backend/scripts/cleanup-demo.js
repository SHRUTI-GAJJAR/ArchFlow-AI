/**
 * Dev-only cleanup: removes demo accounts created by
 * `frontend/scripts/seed-demo.mjs` plus their cascaded projects,
 * communications and insights.
 *
 * Scoped strictly to the demo email pattern so real data is untouched.
 *
 * Usage:
 *   node scripts/cleanup-demo.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Communication = require("../models/Communication");
const AIInsight = require("../models/AIInsight");

const DEMO_EMAIL = /^demo_[\d.]+@archflow\.test$/;

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = await User.find({ email: DEMO_EMAIL }).select("_id email");

    if (users.length === 0) {
      console.log("No demo accounts found. Nothing to clean.");
      return;
    }

    const userIds = users.map((user) => user._id);
    const projects = await Project.find({ owner: { $in: userIds } }).select("_id");

    const projectIds = projects.map((project) => project._id);

    const communications = projectIds.length
      ? await Communication.find({ project: { $in: projectIds } }).select("_id")
      : [];

    const communicationIds = communications.map((doc) => doc._id);

    const insights = communicationIds.length
      ? await AIInsight.deleteMany({ communication: { $in: communicationIds } })
      : { deletedCount: 0 };

    const commsDeleted = communicationIds.length
      ? (await Communication.deleteMany({ _id: { $in: communicationIds } })).deletedCount
      : 0;

    const projectsDeleted = projectIds.length
      ? (await Project.deleteMany({ _id: { $in: projectIds } })).deletedCount
      : 0;

    const usersDeleted = (await User.deleteMany({ _id: { $in: userIds } })).deletedCount;

    console.log(
      `Removed ${usersDeleted} demo user(s), ${projectsDeleted} project(s), ` +
        `${commsDeleted} communication(s), ${insights.deletedCount} insight(s).`
    );
  } catch (error) {
    console.error("Cleanup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();