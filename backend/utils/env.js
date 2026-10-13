// Fail fast at boot when required environment variables are missing.
// Without this, a missing JWT_SECRET only surfaces much later as a
// confusing 500 on the first login attempt.
//
// Note: AI provider keys are NOT in REQUIRED_VARS. The app only needs one of
// GROQ_API_KEY (free tier) or HF_TOKEN, so hard-requiring HF_TOKEN would stop
// the server from booting for someone who is using Groq. The AI routes report
// a clear configuration error instead, lazily, on first use.
const REQUIRED_VARS = ["MONGODB_URI", "JWT_SECRET"];

function assertEnv(requiredVars = REQUIRED_VARS) {
  const missing = requiredVars.filter(
    (name) => !process.env[name] || !process.env[name].trim()
  );

  if (missing.length > 0) {
    console.error(
      `\n[config] Missing required environment variables: ${missing.join(", ")}`
    );
    console.error(
      "[config] Copy backend/.env.example to backend/.env and fill in the values.\n"
    );
    process.exit(1);
  }
}

module.exports = { assertEnv, REQUIRED_VARS };