const { InferenceClient } = require("@huggingface/inference");

const hf = new InferenceClient(process.env.HF_TOKEN);

const testAI = async () => {
  const response = await hf.chatCompletion({
    model: "openai/gpt-oss-120b",

    messages: [
      {
        role: "user",
        content: "Reply with exactly: ArchFlow AI connection successful",
      },
    ],

    max_tokens: 200,
    temperature: 0,
  });

  console.log(
    "FULL AI RESPONSE:",
    JSON.stringify(response, null, 2)
  );

  return response.choices[0].message.content;
};

module.exports = {
  testAI,
};