const mongoose = require("mongoose");

let mongoServer;
let started = false;

// Spins up an isolated in-memory MongoDB for the test run and connects
// Mongoose to it. Returns a teardown function.
async function startTestDb() {
  if (started) {
    throw new Error("Test database already started");
  }

  const { MongoMemoryServer } = require("mongodb-memory-server");

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  started = true;

  return async function stopTestDb() {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
    started = false;
  };
}

// Wipes all documents between tests while keeping the connection open.
async function clearDb() {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
}

module.exports = { startTestDb, clearDb };