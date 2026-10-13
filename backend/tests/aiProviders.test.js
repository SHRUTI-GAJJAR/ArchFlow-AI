const test = require("node:test");
const assert = require("node:assert/strict");

// Load the service with a controlled provider configuration. This file does
// not load .env, so the keys set here are the ones the service sees.
process.env.GROQ_API_KEY = "gsk_test";
process.env.HF_TOKEN = "hf_test";
delete process.env.AI_PROVIDER;

const {
  resolveProvider,
  toApiError,
  isProviderConfigError,
  isRetryable,
} = require("../services/aiService");

test("groq is preferred when both keys are configured", () => {
  assert.equal(resolveProvider().name, "groq");
});

test("AI_PROVIDER pins the requested provider", () => {
  process.env.AI_PROVIDER = "huggingface";
  assert.equal(resolveProvider().name, "huggingface");
  delete process.env.AI_PROVIDER;
});

test("falls back to huggingface when only HF_TOKEN is set", () => {
  const groqKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  assert.equal(resolveProvider().name, "huggingface");
  process.env.GROQ_API_KEY = groqKey;
});

test("missing every key throws a configuration ApiError", () => {
  const groqKey = process.env.GROQ_API_KEY;
  const hfToken = process.env.HF_TOKEN;
  delete process.env.GROQ_API_KEY;
  delete process.env.HF_TOKEN;

  assert.throws(() => resolveProvider(), (err) => {
    assert.equal(err.name, "ApiError");
    assert.match(err.message, /GROQ_API_KEY/);
    return true;
  });

  process.env.GROQ_API_KEY = groqKey;
  process.env.HF_TOKEN = hfToken;
});

test("an unknown AI_PROVIDER is rejected rather than silently falling back", () => {
  process.env.AI_PROVIDER = "gemini";

  assert.throws(() => resolveProvider(), (err) => {
    assert.equal(err.name, "ApiError");
    assert.match(err.message, /Unknown AI_PROVIDER/);
    return true;
  });

  delete process.env.AI_PROVIDER;
});

test("a pinned provider with no key is reported clearly", () => {
  const groqKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  process.env.AI_PROVIDER = "groq";

  assert.throws(() => resolveProvider(), /GROQ_API_KEY is not set/);

  process.env.GROQ_API_KEY = groqKey;
  delete process.env.AI_PROVIDER;
});

test("provider failures map to actionable statuses", () => {
  const cases = [
    [
      "hugging face out of credits",
      new Error(
        "Failed to perform inference: You have no remaining credits. Purchase pre-paid credits."
      ),
      503,
    ],
    ["invalid key", Object.assign(new Error("Unauthorized"), { status: 401 }), 502],
    ["forbidden key", Object.assign(new Error("Forbidden"), { status: 403 }), 502],
    ["rate limited", Object.assign(new Error("Too Many Requests"), { status: 429 }), 429],
    ["unknown model", Object.assign(new Error("model not found"), { status: 400 }), 502],
    ["truncated json", new Error("AI response did not contain a complete JSON object"), 502],
    ["network unreachable", new Error("fetch failed"), 503],
  ];

  for (const [name, error, expectedStatus] of cases) {
    const apiError = toApiError(error);
    assert.equal(apiError.statusCode, expectedStatus, name);
    assert.equal(apiError.isOperational, true, name);
  }
});

test("a genuine bug still resolves to an opaque 500", () => {
  const apiError = toApiError(new Error("cannot read property x of undefined"));

  assert.equal(apiError.statusCode, 500);
  // Must not leak internals to the client.
  assert.equal(apiError.message, "Internal server error.");
});

test("an ApiError passes through unchanged", () => {
  const original = toApiError(Object.assign(new Error("x"), { status: 401 }));
  assert.equal(toApiError(original), original);
});

test("billing and credential failures are never retried", () => {
  const noCredits = new Error("You have no remaining credits. Purchase pre-paid credits.");

  assert.equal(isRetryable(noCredits), false);
  assert.equal(isProviderConfigError(noCredits), true);
  assert.equal(isRetryable(Object.assign(new Error("x"), { status: 401 })), false);
  assert.equal(isRetryable(Object.assign(new Error("x"), { status: 400 })), false);
});

test("transient failures are retried", () => {
  assert.equal(isRetryable(Object.assign(new Error("x"), { status: 429 })), true);
  assert.equal(isRetryable(Object.assign(new Error("x"), { status: 503 })), true);
  assert.equal(isRetryable(new Error("JSON parse failed")), true);
  assert.equal(isRetryable(new Error("fetch failed")), true);
});