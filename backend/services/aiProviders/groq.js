// Groq provider.
//
// Chosen as the default because its free tier needs no credit card and it
// serves openai/gpt-oss-120b - the same model the Hugging Face route used -
// so switching providers does not change model behaviour or the prompt.
//
// Uses the platform fetch rather than the groq-sdk: one less dependency, and
// the endpoint is OpenAI-compatible, so the request body stays boring.

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// gpt-oss-120b is the same weights as before. Swap to llama-3.3-70b-versatile
// or llama-3.1-8b-instant via GROQ_MODEL without touching any other code.
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const model = () => process.env.GROQ_MODEL || DEFAULT_MODEL;

/**
 * Call Groq's OpenAI-compatible chat completions endpoint.
 * @returns {Promise<{content: string, finishReason: string|null, usage: object|null}>}
 */
const chatCompletion = async ({ messages, maxTokens, temperature }) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model(),
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
    // The Groq free tier is rate limited; fail fast instead of hanging.
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new Error(
      `Groq request failed (${response.status}): ${body.slice(0, 300)}`
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  const data = await response.json();
  const choice = data?.choices?.[0];

  return {
    content: choice?.message?.content,
    finishReason: choice?.finish_reason ?? null,
    usage: data?.usage ?? null,
  };
};

module.exports = { chatCompletion, model, DEFAULT_MODEL, name: "groq" };