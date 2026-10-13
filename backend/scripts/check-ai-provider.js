// Preflight check for the configured AI provider.
//
// A dead or unfunded key is invisible until a user clicks "Analyze with AI"
// and gets an error. This makes it detectable on demand, and in CI/deploy
// logs.
//
//   npm run check:ai
//
// Exits 0 when the provider is usable, 1 otherwise, so it can gate a deploy.

require("dotenv").config();

const { resolveProvider, isProviderConfigError } = require("../services/aiService");

const ok = (m) => console.log(`  ok    ${m}`);
const bad = (m) => console.log(`  FAIL  ${m}`);
const warn = (m) => console.log(`  warn  ${m}`);

(async () => {
  let provider;

  try {
    provider = resolveProvider();
  } catch (error) {
    bad(error.message);
    console.log(
      "\nSet GROQ_API_KEY (free tier, no credit card) in backend/.env.\n"
    );
    process.exit(1);
  }

  console.log(`\nAI provider check\n`);
  console.log(`  provider : ${provider.name}`);
  console.log(`  model    : ${provider.model()}\n`);

  // A minimal, cheap completion - enough to prove the key authenticates and
  // the account has quota, without paying for a real analysis.
  try {
    const result = await provider.chatCompletion({
      messages: [{ role: "user", content: "Reply with the single word: ok" }],
      maxTokens: 8,
      temperature: 0,
    });

    if (!result?.content) {
      bad("Provider returned an empty response.");
      process.exit(1);
    }

    ok(`Provider responded: "${result.content.trim().slice(0, 40)}"`);

    if (result.usage) {
      console.log(
        `  info    tokens in=${result.usage.prompt_tokens ?? "?"} out=${result.usage.completion_tokens ?? "?"}`
      );
    }

    console.log("\nAI analysis should work.\n");
    process.exit(0);
  } catch (error) {
    const status = error?.status ?? error?.statusCode ?? error?.response?.status;
    const message = error?.message || "Unknown error";

    if (status === 401 || status === 403) {
      bad("Key rejected (401/403) - invalid, expired, or revoked.");
    } else if (status === 429) {
      warn("Rate limited (429). The key works but is being throttled.");
    } else if (isProviderConfigError(error)) {
      bad("Hugging Face account has no remaining credits / no active subscription.");
    } else if (status === 400) {
      bad(`Provider rejected the request (400): ${message.slice(0, 140)}`);
      console.log("  hint    check GROQ_MODEL is a valid model id");
    } else if (status >= 500) {
      bad(`Provider returned ${status}: ${message.slice(0, 140)}`);
    } else {
      bad(`Request failed: ${message.slice(0, 140)}`);
    }

    console.log(
      "\nUntil this passes, every \"Analyze with AI\" request will fail.\n"
    );
    process.exit(1);
  }
})();