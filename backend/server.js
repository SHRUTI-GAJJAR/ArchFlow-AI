const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const { assertEnv } = require("./utils/env");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const communicationRoutes = require("./routes/communicationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/errorMiddleware");

// Fail fast rather than surfacing confusing runtime errors later.
assertEnv();

const app = express();

// ---------- Security headers ----------
app.use(helmet());

// ---------- CORS ----------
// Comma-separated allowlist, overridable via CORS_ORIGIN.
// The defaults cover local Vite plus the deployed frontend, so a fresh
// deploy works even before the env var is set. Override CORS_ORIGIN in
// production to pin the exact origins you trust; use "*" only for local
// testing.
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://arch-flow-ai-eosin.vercel.app",
].join(",");

const allowedOrigins = (process.env.CORS_ORIGIN || DEFAULT_ORIGINS)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin/non-browser callers (curl, health checks, mobile).
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

// ---------- Body parsing ----------
// 1MB ceiling: `content` is unbounded in the schema and is forwarded to the
// AI provider, so oversized payloads should be rejected at the edge.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ---------- Global rate limiting ----------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again shortly.",
  },
});

app.use(globalLimiter);

const PORT = process.env.PORT || 5500;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ArchFlow AI backend is running",
  });
});

// Liveness probe that also reports database connectivity.
app.get("/health", async (req, res) => {
  const mongoose = require("mongoose");
  const dbReady = mongoose.connection.readyState === 1;

  res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    status: dbReady ? "ok" : "degraded",
    database: dbReady ? "connected" : "disconnected",
    uptime: Math.round(process.uptime()),
  });
});

// User routes:
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/ai", aiRoutes);

// 404 for unmatched routes, then the central error formatter.
// These must stay last so every route is covered.
app.use(notFoundHandler);
app.use(errorHandler);

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Close the HTTP server and DB pool cleanly on termination signals.
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    const mongoose = require("mongoose");
    mongoose.connection.close(false).then(() => process.exit(0));
  });

  // Do not hang forever if a connection refuses to close.
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// A rejected promise anywhere should be logged, not left silent.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

module.exports = app;