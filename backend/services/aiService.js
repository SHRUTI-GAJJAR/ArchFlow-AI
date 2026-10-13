const ApiError = require("../utils/ApiError");
const { parseInsight } = require("./aiResponseParser");
const groq = require("./aiProviders/groq");
const huggingface = require("./aiProviders/huggingface");

const PROVIDERS = { groq, huggingface };

const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 600;
const MAX_TOKENS = 2000;

/*
 * Pick the provider to use.
 *
 * AI_PROVIDER pins one explicitly; otherwise the first configured key wins,
 * preferring Groq because its free tier needs no credit card while a funded
 * Hugging Face account is a deliberate, paid choice.
 */
const resolveProvider = () => {
  const requested = (process.env.AI_PROVIDER || "").trim().toLowerCase();

  if (requested) {
    if (!PROVIDERS[requested]) {
      throw ApiError.internal(
        `Unknown AI_PROVIDER "${requested}". Use one of: ${Object.keys(PROVIDERS).join(", ")}.`
      );
    }

    const key = requested === "groq" ? "GROQ_API_KEY" : "HF_TOKEN";

    if (!process.env[key]) {
      throw ApiError.internal(
        `AI_PROVIDER is "${requested}" but ${key} is not set.`
      );
    }

    return PROVIDERS[requested];
  }

  if (process.env.GROQ_API_KEY) return groq;
  if (process.env.HF_TOKEN) return huggingface;

  throw ApiError.internal(
    "AI analysis is not configured. Set GROQ_API_KEY (free tier, no credit card) or HF_TOKEN."
  );
};

const SYSTEM_PROMPT = `
You are an AI project communication analyst.

Analyze the provided project communication and return ONLY valid JSON.

The JSON must contain exactly these fields:

{
  "summary": "short summary of the communication",
  "decisions": [],
  "actionItems": [
    {
      "task": "",
      "assignee": "",
      "deadline": ""
    }
  ],
  "deadlines": [
    {
      "description": "",
      "date": ""
    }
  ],
  "peopleInvolved": []
}

Rules:
- Do not invent information.
- If something is not mentioned, use an empty array or empty string.
- Keep the summary concise.
- Extract explicit decisions.
- Extract tasks that someone needs to complete.
- Include the responsible person when clearly mentioned.
- Include deadlines when clearly mentioned.
- Return JSON only.
        `;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const statusOf = (error) =>
  error?.status ?? error?.statusCode ?? error?.response?.status ?? null;

// Hugging Face reports exhausted quota as a plain 500 whose body is prose, so
// it has to be matched by message rather than by status code.
const isProviderConfigError = (error) =>
  /no remaining credits|purchase pre-?paid|billing|subscription|\bPRO\b|insufficient_quota|quota exceeded/i.test(
    error?.message || ""
  );

// Retryable: transient upstream failures, rate limits, and malformed output
// (usually fixed by asking again).
//
// Credential and billing failures are deliberately excluded - retrying them
// just burns wall-clock time before failing the same way three times.
const isRetryable = (error) => {
  const status = statusOf(error);
  const message = error?.message || "";

  if (status === 400 || status === 401 || status === 402 || status === 403) {
    return false;
  }

  if (isProviderConfigError(error)) return false;

  if (status === 429 || status >= 500) return true;

  return /JSON|parse|empty response|fetch failed|network|ETIMEDOUT|ECONNRESET|abort/i.test(
    message
  );
};

/*
 * Turn a raw provider/parser failure into an ApiError so the client gets an
 * actionable message instead of a blanket "Internal server error.".
 *
 * Without this, a dead key (expired, revoked, or out of credits) was
 * indistinguishable from a genuine bug: every path collapsed into an opaque
 * 500 and the real cause only existed in the server log.
 */
const toApiError = (error) => {
  if (error instanceof ApiError) return error;

  const status = statusOf(error);
  const message = error?.message || "Unknown error";

  if (status === 401 || status === 403) {
    return new ApiError(
      502,
      "AI analysis is unavailable: the provider API key is invalid, expired, or was revoked. Check the configured key on the server."
    );
  }

  if (isProviderConfigError(error)) {
    return new ApiError(
      503,
      "AI analysis is unavailable: the Hugging Face account has no remaining credits. Set GROQ_API_KEY for the free tier, or fund the Hugging Face account."
    );
  }

  if (status === 429) {
    return new ApiError(
      429,
      "The free AI tier's rate limit was reached. Wait a minute and try again."
    );
  }

  if (status === 400) {
    // Groq returns 400 for an unknown model, which is a config typo rather
    // than a bad user request.
    return new ApiError(
      502,
      `The AI provider rejected the request: ${message.slice(0, 160)}`
    );
  }

  if (
    /did not contain a complete JSON object|was not a JSON object|Unexpected token|JSON\.parse/i.test(
      message
    )
  ) {
    return new ApiError(
      502,
      "The AI returned a response that could not be parsed. Try analyzing this communication again."
    );
  }

  if (/fetch failed|ETIMEDOUT|ECONNRESET|ENOTFOUND|network|abort/i.test(message)) {
    return new ApiError(
      503,
      "Could not reach the AI provider. Check the server's network access and try again."
    );
  }

  // Anything else is a genuine bug: keep it server-side.
  return ApiError.internal("Internal server error.");
};

/**
 * Analyze communication text.
 *
 * Returns a validated insight object ready for the AIInsight model. Retries
 * transient failures and malformed output before giving up.
 */
const analyzeCommunication = async (content) => {
  if (!content || !String(content).trim()) {
    throw ApiError.badRequest("Cannot analyze empty communication content.");
  }

  const provider = resolveProvider();

  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await provider.chatCompletion({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: String(content) },
        ],
        maxTokens: MAX_TOKENS,
        temperature: 0,
      });

      if (!result?.content) {
        throw new Error("AI returned an empty response");
      }

      // A truncated response parses as unbalanced braces; catching it here
      // lets the retry loop ask again with the same budget.
      if (result.finishReason === "length") {
        throw new Error(
          "AI response was truncated (finish_reason: length)"
        );
      }

      return parseInsight(result.content);
    } catch (error) {
      lastError = error;

      const shouldRetry = attempt < MAX_ATTEMPTS && isRetryable(error);

      if (!shouldRetry) break;

      // Exponential backoff: ~0.6s, ~1.2s.
      await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }

  throw toApiError(lastError);
};

module.exports = {
  analyzeCommunication,
  resolveProvider,
  toApiError,
  isProviderConfigError,
  isRetryable,
  SYSTEM_PROMPT,
  MAX_TOKENS,
  MAX_ATTEMPTS,
};