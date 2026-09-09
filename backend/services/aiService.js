const { InferenceClient } = require("@huggingface/inference");

const hf = new InferenceClient(process.env.HF_TOKEN);

// Analyze communication
const analyzeCommunication = async (content) => {
  const response = await hf.chatCompletion({
    model: "openai/gpt-oss-120b",

    messages: [
      {
        role: "system",
        content: `
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
        `,
      },
      {
        role: "user",
        content: content,
      },
    ],

    max_tokens: 1000,
    temperature: 0,
  });

  const result = response.choices[0].message.content;

  if (!result) {
    throw new Error("AI returned an empty response");
  }

  const cleanedResult = result
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return cleanedResult;
};

module.exports = {
  analyzeCommunication,
};