const test = require("node:test");
const assert = require("node:assert/strict");

const { startTestDb, clearDb } = require("./testDb");
const mongoose = require("mongoose");

// server.js validates the environment and opens a listening socket on
// import, so the app under test is built from the same pieces here with
// test-friendly values.
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/archflow-test";
process.env.JWT_SECRET = "test-secret-value";
process.env.HF_TOKEN = "test-hf-token";
process.env.NODE_ENV = "test";

const request = require("supertest");
const express = require("express");

const cors = require("cors");
const helmet = require("helmet");
const { assertEnv } = require("../utils/env");
const userRoutes = require("../routes/userRoutes");
const authRoutes = require("../routes/authRoutes");
const projectRoutes = require("../routes/projectRoutes");
const communicationRoutes = require("../routes/communicationRoutes");
const aiRoutes = require("../routes/aiRoutes");
const {
  notFoundHandler,
  errorHandler,
} = require("../middleware/errorMiddleware");

assertEnv();

const Project = require("../models/Project");
const Communication = require("../models/Communication");
const AIInsight = require("../models/AIInsight");

function buildApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (req, res) => {
    res.json({ success: true, message: "ArchFlow AI backend is running" });
  });

  app.use("/api/users", userRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/communications", communicationRoutes);
  app.use("/api/ai", aiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = buildApp();

let stopDb;
const authHeaderFor = {};

async function register(email, name = "Test User") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name, email, password: "secret123" });

  assert.equal(res.status, 201);
  return { token: res.body.token, userId: res.body.user.id, res };
}

test.before(async () => {
  stopDb = await startTestDb();
});

test.after(async () => {
  if (stopDb) await stopDb();
});

test.beforeEach(async () => {
  await clearDb();
});

// ----------------------------------------------------------------
// Regression tests for the IDOR fix in userController.js
// ----------------------------------------------------------------

test("GET /api/users/me returns only the caller's own profile", async () => {
  const owner = await register("owner@example.com");
  const other = await register("other@example.com");

  const res = await request(app)
    .get("/api/users/me")
    .set("Authorization", `Bearer ${owner.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, "owner@example.com");
  assert.equal(res.body.user._id, owner.userId);
  assert.equal(res.body.user.password, undefined);
  assert.notEqual(res.body.user.email, other.userId);

  authHeaderFor.owner = owner;
});

test("GET /api/users no longer leaks every user in the database", async () => {
  await register("owner@example.com");
  await register("other@example.com");

  const owner = await register("third@example.com");

  // The listing endpoint is gone; it must not return user records.
  const res = await request(app)
    .get("/api/users")
    .set("Authorization", `Bearer ${owner.token}`);

  assert.notEqual(res.status, 200);
  assert.equal(res.body.users, undefined);
});

test("a user cannot read another user's record by id", async () => {
  const victim = await register("victim@example.com");
  const attacker = await register("attacker@example.com");

  const res = await request(app)
    .get(`/api/users/${victim.userId}`)
    .set("Authorization", `Bearer ${attacker.token}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.user, undefined);
  assert.equal(res.body.success, false);
});

test("a user cannot update another user's email (the original IDOR)", async () => {
  const victim = await register("victim@example.com");
  const attacker = await register("attacker@example.com");

  const res = await request(app)
    .put(`/api/users/${victim.userId}`)
    .set("Authorization", `Bearer ${attacker.token}`)
    .send({ email: "attacker-controlled@example.com" });

  assert.notEqual(res.status, 200);
  assert.equal(res.body.user, undefined);

  // The victim's email must be untouched.
  const check = await request(app)
    .post("/api/auth/login")
    .send({ email: "victim@example.com", password: "secret123" });

  assert.equal(check.status, 200);
});

test("a user cannot delete another account", async () => {
  const victim = await register("victim@example.com");
  const attacker = await register("attacker@example.com");

  const res = await request(app)
    .delete(`/api/users/${victim.userId}`)
    .set("Authorization", `Bearer ${attacker.token}`);

  assert.notEqual(res.status, 200);

  // Victim must still be able to log in.
  const check = await request(app)
    .post("/api/auth/login")
    .send({ email: "victim@example.com", password: "secret123" });

  assert.equal(check.status, 200);
});

test("PATCH /api/users/me updates the caller's own profile", async () => {
  const user = await register("me@example.com");

  const res = await request(app)
    .patch("/api/users/me")
    .set("Authorization", `Bearer ${user.token}`)
    .send({ name: "Renamed User" });

  assert.equal(res.status, 200);
  assert.equal(res.body.user.name, "Renamed User");
});

// ----------------------------------------------------------------
// ObjectId validation
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// Ownership helper error propagation (regression: ApiError invoked
// without `new` previously turned denials into a 500)
// ----------------------------------------------------------------

test("fetching a non-existent communication returns 404, not 500", async () => {
  const user = await register("missingcomm@example.com");
  const missingId = new mongoose.Types.ObjectId().toString();

  const res = await request(app)
    .get(`/api/communications/${missingId}`)
    .set("Authorization", `Bearer ${user.token}`);

  assert.equal(res.status, 404);
  assert.match(res.body.message, /Communication not found/);
});

test("fetching another user's communication returns 403, not 500", async () => {
  const owner = await register("owncomm@example.com");
  const intruder = await register("intrudecomm@example.com");

  const project = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({ name: "Private" });

  const communication = await request(app)
    .post("/api/communications")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({
      project: project.body.project._id,
      title: "Secret",
      content: "Secret content",
    });

  const communicationId = communication.body.communication._id;

  const res = await request(app)
    .get(`/api/communications/${communicationId}`)
    .set("Authorization", `Bearer ${intruder.token}`);

  assert.equal(res.status, 403);
  assert.match(res.body.message, /Not authorized/);
});

test("deleting another user's communication returns 403, not 500", async () => {
  const owner = await register("owncomm2@example.com");
  const intruder = await register("intrudecomm2@example.com");

  const project = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({ name: "Private 2" });

  const communication = await request(app)
    .post("/api/communications")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({ project: project.body.project._id, title: "Kept", content: "Keep me" });

  const communicationId = communication.body.communication._id;

  const res = await request(app)
    .delete(`/api/communications/${communicationId}`)
    .set("Authorization", `Bearer ${intruder.token}`);

  assert.equal(res.status, 403);

  // Still present.
  const check = await Communication.findById(communicationId);
  assert.ok(check);
});

test("reading an insight for a missing communication returns 404", async () => {
  const user = await register("missinginsight@example.com");
  const missingId = new mongoose.Types.ObjectId().toString();

  const res = await request(app)
    .get(`/api/ai/insight/${missingId}`)
    .set("Authorization", `Bearer ${user.token}`);

  assert.equal(res.status, 404);
});

test("GET /api/projects/:id rejects a malformed id with 400 not 500", async () => {
  const user = await register("u@example.com");

  const res = await request(app)
    .get("/api/projects/not-a-valid-object-id")
    .set("Authorization", `Bearer ${user.token}`);

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Invalid id/);
});

test("GET /api/communications/:id rejects a malformed id with 400", async () => {
  const user = await register("u2@example.com");

  const res = await request(app)
    .get("/api/communications/12345")
    .set("Authorization", `Bearer ${user.token}`);

  assert.equal(res.status, 400);
});

test("a valid but unknown id returns 404", async () => {
  const user = await register("u3@example.com");
  const missingId = new mongoose.Types.ObjectId().toString();

  const res = await request(app)
    .get(`/api/projects/${missingId}`)
    .set("Authorization", `Bearer ${user.token}`);

  assert.equal(res.status, 404);
});

// ----------------------------------------------------------------
// Project ownership
// ----------------------------------------------------------------

test("projects are scoped to their owner", async () => {
  const owner = await register("owner2@example.com");
  const intruder = await register("intruder@example.com");

  const created = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({ name: "Riverside Residence", status: "active" });

  assert.equal(created.status, 201);
  const projectId = created.body.project._id;

  // Intruder's list must not contain it.
  const list = await request(app)
    .get("/api/projects")
    .set("Authorization", `Bearer ${intruder.token}`);

  assert.equal(list.body.projects.length, 0);

  // Direct fetch is refused.
  const fetchRes = await request(app)
    .get(`/api/projects/${projectId}`)
    .set("Authorization", `Bearer ${intruder.token}`);

  assert.equal(fetchRes.status, 404);
});

// ----------------------------------------------------------------
// Cascade deletes
// ----------------------------------------------------------------

test("deleting a project cascades to communications and insights", async () => {
  const user = await register("cascade@example.com");
  const auth = { Authorization: `Bearer ${user.token}` };

  const project = await request(app)
    .post("/api/projects")
    .set(auth)
    .send({ name: "To be deleted" });

  const projectId = project.body.project._id;

  const communication = await request(app)
    .post("/api/communications")
    .set(auth)
    .send({
      project: projectId,
      title: "Kickoff meeting",
      source: "meeting",
      content: "The client approved the revised layout.",
      participants: ["Client", "Architect"],
    });

  assert.equal(communication.status, 201);
  const communicationId = communication.body.communication._id;

  // Seed an insight directly so we can prove it is cleaned up.
  await AIInsight.create({
    communication: communicationId,
    summary: "Approval",
    decisions: ["Approved layout"],
  });

  assert.equal(await AIInsight.countDocuments({ communication: communicationId }), 1);

  const del = await request(app).delete(`/api/projects/${projectId}`).set(auth);

  assert.equal(del.status, 200);
  assert.equal(del.body.deletedCommunications, 1);

  assert.equal(await Communication.countDocuments({ project: projectId }), 0);
  assert.equal(await AIInsight.countDocuments({ communication: communicationId }), 0);
});

test("deleting a communication cascades to its insight", async () => {
  const user = await register("cascade2@example.com");
  const auth = { Authorization: `Bearer ${user.token}` };

  const project = await request(app)
    .post("/api/projects")
    .set(auth)
    .send({ name: "Keep this" });

  const projectId = project.body.project._id;

  const communication = await request(app)
    .post("/api/communications")
    .set(auth)
    .send({
      project: projectId,
      title: "Site visit",
      content: "Supplier confirmed tiles are available.",
    });

  const communicationId = communication.body.communication._id;

  await AIInsight.create({
    communication: communicationId,
    summary: "Tiles available",
  });

  const del = await request(app)
    .delete(`/api/communications/${communicationId}`)
    .set(auth);

  assert.equal(del.status, 200);
  assert.equal(await AIInsight.countDocuments({ communication: communicationId }), 0);
});

// ----------------------------------------------------------------
// Insight invalidation on content edit
// ----------------------------------------------------------------

test("editing communication content invalidates the stale insight", async () => {
  const user = await register("invalidate@example.com");
  const auth = { Authorization: `Bearer ${user.token}` };

  const project = await request(app)
    .post("/api/projects")
    .set(auth)
    .send({ name: "Stale insight project" });

  const projectId = project.body.project._id;

  const communication = await request(app)
    .post("/api/communications")
    .set(auth)
    .send({
      project: projectId,
      title: "Planning call",
      content: "Original content about the living room.",
    });

  const communicationId = communication.body.communication._id;

  await AIInsight.create({
    communication: communicationId,
    summary: "Summary of the ORIGINAL content",
  });

  const res = await request(app)
    .patch(`/api/communications/${communicationId}`)
    .set(auth)
    .send({ content: "Completely different content about the kitchen." });

  assert.equal(res.status, 200);
  assert.equal(res.body.insightInvalidated, true);

  // The insight describing the old text must be gone.
  assert.equal(await AIInsight.countDocuments({ communication: communicationId }), 0);

  // And the insight endpoint now reports not found.
  const insightRes = await request(app)
    .get(`/api/ai/insight/${communicationId}`)
    .set(auth);

  assert.equal(insightRes.status, 404);
});

test("editing only the title keeps the insight intact", async () => {
  const user = await register("keeptitle@example.com");
  const auth = { Authorization: `Bearer ${user.token}` };

  const project = await request(app)
    .post("/api/projects")
    .set(auth)
    .send({ name: "Title edit project" });

  const projectId = project.body.project._id;

  const communication = await request(app)
    .post("/api/communications")
    .set(auth)
    .send({ project: projectId, title: "Old title", content: "Unchanged body." });

  const communicationId = communication.body.communication._id;

  await AIInsight.create({
    communication: communicationId,
    summary: "Still valid",
  });

  const res = await request(app)
    .patch(`/api/communications/${communicationId}`)
    .set(auth)
    .send({ title: "New title" });

  assert.equal(res.status, 200);
  assert.equal(res.body.insightInvalidated, false);
  assert.equal(await AIInsight.countDocuments({ communication: communicationId }), 1);
});

// ----------------------------------------------------------------
// Batch insights endpoint (replaces the frontend N+1 waterfall)
// ----------------------------------------------------------------

test("POST /api/ai/insights/batch returns insights in one call", async () => {
  const user = await register("batch@example.com");
  const auth = { Authorization: `Bearer ${user.token}` };

  const project = await request(app)
    .post("/api/projects")
    .set(auth)
    .send({ name: "Batch project" });

  const projectId = project.body.project._id;

  const created = [];
  for (let i = 0; i < 3; i += 1) {
    const res = await request(app)
      .post("/api/communications")
      .set(auth)
      .send({
        project: projectId,
        title: `Meeting ${i}`,
        content: `Content number ${i}`,
      });
    created.push(res.body.communication._id);
  }

  // Only the first has an insight.
  await AIInsight.create({ communication: created[0], summary: "First" });

  const res = await request(app)
    .post("/api/ai/insights/batch")
    .set(auth)
    .send({ communicationIds: created });

  assert.equal(res.status, 200);

  const keys = Object.keys(res.body.insights);
  assert.equal(keys.length, 1);
  assert.equal(keys[0], created[0]);
  assert.equal(res.body.insights[created[0]].summary, "First");
});

test("batch insights never returns another user's data", async () => {
  const owner = await register("batchowner@example.com");
  const intruder = await register("batchintruder@example.com");

  const project = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({ name: "Private project" });

  const communication = await request(app)
    .post("/api/communications")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({
      project: project.body.project._id,
      title: "Confidential",
      content: "Secret content",
    });

  const communicationId = communication.body.communication._id;
  await AIInsight.create({ communication: communicationId, summary: "Secret summary" });

  const res = await request(app)
    .post("/api/ai/insights/batch")
    .set("Authorization", `Bearer ${intruder.token}`)
    .send({ communicationIds: [communicationId] });

  assert.equal(res.status, 200);
  assert.equal(Object.keys(res.body.insights).length, 0);
});

test("batch insights ignores malformed ids instead of erroring", async () => {
  const user = await register("batchbad@example.com");

  const res = await request(app)
    .post("/api/ai/insights/batch")
    .set("Authorization", `Bearer ${user.token}`)
    .send({ communicationIds: ["garbage", 42, null] });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.insights, {});
});

test("batch insights requires a non-empty array", async () => {
  const user = await register("batchempty@example.com");

  const res = await request(app)
    .post("/api/ai/insights/batch")
    .set("Authorization", `Bearer ${user.token}`)
    .send({ communicationIds: [] });

  assert.equal(res.status, 400);
});

// ----------------------------------------------------------------
// Dashboard insight summary
// ----------------------------------------------------------------

test("GET /api/ai/insights/summary returns real counts, not a placeholder", async () => {
  const user = await register("summary@example.com");
  const auth = { Authorization: `Bearer ${user.token}` };

  const project = await request(app)
    .post("/api/projects")
    .set(auth)
    .send({ name: "Summary project" });

  const projectId = project.body.project._id;

  const communications = [];
  for (let i = 0; i < 2; i += 1) {
    const res = await request(app)
      .post("/api/communications")
      .set(auth)
      .send({ project: projectId, title: `Comms ${i}`, content: `Body ${i}` });
    communications.push(res.body.communication._id);
  }

  await AIInsight.create({
    communication: communications[0],
    summary: "One",
    actionItems: [
      { task: "Do a thing", status: "pending" },
      { task: "Do another thing", status: "completed" },
    ],
    deadlines: [{ description: "Delivery", date: "Friday" }],
  });

  await AIInsight.create({
    communication: communications[1],
    summary: "Two",
    actionItems: [{ task: "Pending thing", status: "pending" }],
  });

  const res = await request(app).get("/api/ai/insights/summary").set(auth);

  assert.equal(res.status, 200);
  assert.equal(res.body.summary.analyzedCommunications, 2);
  assert.equal(res.body.summary.totalActionItems, 3);
  assert.equal(res.body.summary.pendingActionItems, 2);
  assert.equal(res.body.summary.completedActionItems, 1);
  assert.equal(res.body.summary.upcomingDeadlines, 1);
});

test("insight summary is zero for a user with no projects", async () => {
  const user = await register("emptysummary@example.com");

  const res = await request(app)
    .get("/api/ai/insights/summary")
    .set("Authorization", `Bearer ${user.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.summary.totalActionItems, 0);
  assert.equal(res.body.summary.pendingActionItems, 0);
});

test("insight summary never counts another user's projects", async () => {
  const owner = await register("sumowner@example.com");
  const other = await register("sumother@example.com");

  const project = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({ name: "Owner project" });

  const communication = await request(app)
    .post("/api/communications")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({
      project: project.body.project._id,
      title: "Owner comms",
      content: "Owner content",
    });

  await AIInsight.create({
    communication: communication.body.communication._id,
    summary: "Owner",
    actionItems: [{ task: "Owner task", status: "pending" }],
  });

  const res = await request(app)
    .get("/api/ai/insights/summary")
    .set("Authorization", `Bearer ${other.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.summary.totalActionItems, 0);
  assert.equal(res.body.summary.analyzedCommunications, 0);
});

// ----------------------------------------------------------------
// Auth + error handling
// ----------------------------------------------------------------

test("protected routes reject missing and invalid tokens", async () => {
  const none = await request(app).get("/api/projects");
  assert.equal(none.status, 401);

  const bad = await request(app)
    .get("/api/projects")
    .set("Authorization", "Bearer nonsense.token.value");
  assert.equal(bad.status, 401);
});

test("duplicate registration is rejected as a 409", async () => {
  await register("dup@example.com");

  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Copy", email: "dup@example.com", password: "secret123" });

  assert.equal(res.status, 409);
});

test("login does not reveal whether an email exists", async () => {
  const missing = await request(app)
    .post("/api/auth/login")
    .send({ email: "ghost@example.com", password: "secret123" });

  await register("real@example.com");
  const wrongPassword = await request(app)
    .post("/api/auth/login")
    .send({ email: "real@example.com", password: "wrongpassword" });

  assert.equal(missing.status, 401);
  assert.equal(wrongPassword.status, 401);
  assert.equal(missing.body.message, wrongPassword.body.message);
});

test("registration never returns the password hash", async () => {
  const res = await register("hash@example.com");

  assert.equal(res.res.body.user.password, undefined);
  assert.equal(res.res.body.user.email, "hash@example.com");
});

test("unknown routes return a 404 JSON body", async () => {
  const res = await request(app).get("/api/does-not-exist");

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Route not found/);
});

test("security headers are present", async () => {
  const res = await request(app).get("/");

  assert.equal(res.status, 200);
  assert.ok(res.headers["x-content-type-options"] === "nosniff");
  assert.ok(res.headers["x-dns-prefetch-control"] !== undefined);
});

test("mongodb still works after all of the above", async () => {
  // Guards against tests that pass purely because a stub swallowed writes.
  assert.equal(await Project.countDocuments({}), 0);
  await Project.create({ name: "sanity", owner: new mongoose.Types.ObjectId() });
  assert.equal(await Project.countDocuments({}), 1);
});