const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseInsight,
  stripToJson,
  normalizeInsight,
  extractJsonObject,
} = require("../services/aiResponseParser");

test("extractJsonObject finds a balanced object and ignores prose", () => {
  const raw = 'Here is the analysis you asked for:\n{"summary":"ok"}\nHope this helps!';
  assert.equal(extractJsonObject(raw), '{"summary":"ok"}');
});

test("extractJsonObject ignores braces inside strings", () => {
  const raw = '{"summary":"use the {curly} braces"}';
  assert.equal(extractJsonObject(raw), raw);
});

test("extractJsonObject ignores escaped quotes", () => {
  const raw = '{"summary":"she said \\"hi\\""}';
  assert.equal(extractJsonObject(raw), raw);
});

test("extractJsonObject returns null for truncated output", () => {
  assert.equal(extractJsonObject('{"summary":"unfinis'), null);
});

test("stripToJson unwraps markdown fences", () => {
  const raw = '```json\n{"summary":"Fenced"}\n```';
  assert.equal(stripToJson(raw), '{"summary":"Fenced"}');
});

test("stripToJson handles gpt-oss reasoning preamble before the object", () => {
  const raw =
    "Reasoning: the client approved the layout.\n\n" +
    '```\n{"summary":"Approved"}\n```';
  assert.equal(stripToJson(raw), '{"summary":"Approved"}');
});

test("stripToJson rejects non-text responses", () => {
  assert.throws(() => stripToJson(undefined), /non-text/);
});

test("normalizeInsight keeps a well-formed response intact", () => {
  const result = normalizeInsight({
    summary: "The client approved the layout.",
    decisions: ["Approved the revised layout"],
    actionItems: [
      { task: "Prepare updated floor plan", assignee: "Architect", deadline: "Friday" },
    ],
    deadlines: [{ description: "Revised design delivery", date: "Friday" }],
    peopleInvolved: ["Client", "Architect"],
  });

  assert.equal(result.summary, "The client approved the layout.");
  assert.deepEqual(result.decisions, ["Approved the revised layout"]);
  assert.equal(result.actionItems.length, 1);
  assert.equal(result.actionItems[0].assignee, "Architect");
  // status defaults to pending when absent
  assert.equal(result.actionItems[0].status, "pending");
  assert.equal(result.deadlines[0].date, "Friday");
  assert.deepEqual(result.peopleInvolved, ["Client", "Architect"]);
});

test("normalizeInsight fills missing fields with safe defaults", () => {
  const result = normalizeInsight({ summary: "Partial" });

  assert.equal(result.summary, "Partial");
  assert.deepEqual(result.decisions, []);
  assert.deepEqual(result.actionItems, []);
  assert.deepEqual(result.deadlines, []);
  assert.deepEqual(result.peopleInvolved, []);
});

test("normalizeInsight coerces a wrongly typed status", () => {
  const result = normalizeInsight({
    actionItems: [{ task: "Ship it", status: "in-progress" }],
  });

  assert.equal(result.actionItems[0].status, "pending");
});

test("normalizeInsight preserves the completed status", () => {
  const result = normalizeInsight({
    actionItems: [{ task: "Ship it", status: "completed" }],
  });

  assert.equal(result.actionItems[0].status, "completed");
});

test("normalizeInsight drops action items with no task (schema requires it)", () => {
  const result = normalizeInsight({
    actionItems: [{ assignee: "Someone" }, { task: "Real task" }],
  });

  assert.equal(result.actionItems.length, 1);
  assert.equal(result.actionItems[0].task, "Real task");
});

test("normalizeInsight drops non-string array members", () => {
  const result = normalizeInsight({
    decisions: ["valid", null, 42, "  ", "also valid"],
  });

  assert.deepEqual(result.decisions, ["valid", "also valid"]);
});

test("normalizeInsight rejects a non-object payload", () => {
  assert.throws(() => normalizeInsight(["not", "an", "object"]), /not a JSON object/);
  assert.throws(() => normalizeInsight(null), /not a JSON object/);
});

test("parseInsight handles the full noisy-model-output path", () => {
  const raw = [
    "Reasoning: I should summarise the meeting.",
    "",
    "```json",
    JSON.stringify({
      summary: "Client approved the revised living room layout.",
      decisions: ["Use larger east-facing windows"],
      actionItems: [
        { task: "Prepare updated floor plan", assignee: "Architect", deadline: "Friday" },
      ],
      deadlines: [{ description: "Revised design delivery", date: "Friday" }],
      peopleInvolved: ["Client", "Architect", "Supplier"],
    }),
    "```",
    "",
    "Let me know if you would like more detail.",
  ].join("\n");

  const insight = parseInsight(raw);

  assert.equal(insight.summary, "Client approved the revised living room layout.");
  assert.equal(insight.actionItems.length, 1);
  assert.equal(insight.actionItems[0].assignee, "Architect");
  assert.deepEqual(insight.peopleInvolved, ["Client", "Architect", "Supplier"]);
});

test("parseInsight throws a descriptive error on truncated output", () => {
  assert.throws(
    () => parseInsight('{"summary":"cut off'),
    /complete JSON object/
  );
});