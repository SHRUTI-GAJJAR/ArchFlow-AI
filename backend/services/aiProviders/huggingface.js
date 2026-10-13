// Hugging Face provider, kept as a fallback for anyone who has funded credits
// there. Uses the official SDK because it normalises the routing/error shapes
// that the bare REST endpoint leaves inconsistent.

const { InferenceClient } = require("@huggingface/inference");

const DEFAULT_MODEL = "openai/gpt-oss-120b";

const model = () => process.env.HF_MODEL || DEFAULT_MODEL;

let client = null;

const getClient = () => {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is not configured");
  }

  if (!client) {
    client = new InferenceClient(process.env.HF_TOKEN);
  }

  return client;
};

/**
 * @returns {Promise<{content: string, finishReason: string|null, usage: object|null}>}
 */
const chatCompletion = async ({ messages, maxTokens, temperature }) => {
  const response = await getClient().chatCompletion({
    model: model(),
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  const choice = response?.choices?.[0];

  return {
    content: choice?.message?.content,
    finishReason: choice?.finish_reason ?? null,
    usage: response?.usage ?? null,
  };
};

module.exports = { chatCompletion, model, DEFAULT_MODEL, name: "huggingface" };