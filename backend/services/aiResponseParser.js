// Normalises whatever the model returns into a predictable JSON string.
//
// The upstream model can emit:
//   - markdown fences:  ```json { ... } ```
//   - leading prose:   "Here is the analysis:\n{ ... }"
//   - trailing chatter: { ... }\n\nLet me know if you need more detail.
//   - gpt-oss reasoning blocks before the answer
//
// Stripping only the fences (as the previous implementation did) is not
// enough, so we locate the first balanced JSON object instead.

const FENCE_PATTERN = /```(?:json)?\s*([\s\S]*?)```/i;

/**
 * Extract the first balanced {...} block, ignoring braces inside strings.
 * @param {string} text
 * @returns {string|null}
 */
function extractJsonObject(text) {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  // Unbalanced (usually a truncation caused by max_tokens).
  return null;
}

/**
 * Pull a JSON string out of raw model output.
 * @param {string} raw
 * @returns {string}
 */
function stripToJson(raw) {
  if (typeof raw !== "string") {
    throw new Error("AI returned a non-text response");
  }

  const fenced = raw.match(FENCE_PATTERN);
  const candidate = fenced ? fenced[1] : raw;

  const extracted = extractJsonObject(candidate);

  if (!extracted) {
    throw new Error("AI response did not contain a complete JSON object");
  }

  return extracted;
}

const asString = (value) => (typeof value === "string" ? value.trim() : "");

const asStringArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => asString(item))
    .filter((item) => item.length > 0);
};

/**
 * Coerce a parsed object into the exact shape the AIInsight schema expects.
 * Anything missing or malformed collapses to a safe empty default rather
 * than throwing, so a partially valid response is still usable.
 *
 * @param {unknown} parsed
 * @returns {{summary: string, decisions: string[], actionItems: object[], deadlines: object[], peopleInvolved: string[]}}
 */
function normalizeInsight(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI response was not a JSON object");
  }

  const actionItems = Array.isArray(parsed.actionItems)
    ? parsed.actionItems
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          task: asString(item.task),
          assignee: asString(item.assignee),
          deadline: asString(item.deadline),
          status: item.status === "completed" ? "completed" : "pending",
        }))
        // A task label is required by the schema; drop nameless entries.
        .filter((item) => item.task.length > 0)
    : [];

  const deadlines = Array.isArray(parsed.deadlines)
    ? parsed.deadlines
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          description: asString(item.description),
          date: asString(item.date),
        }))
        .filter((item) => item.description.length > 0)
    : [];

  return {
    summary: asString(parsed.summary),
    decisions: asStringArray(parsed.decisions),
    actionItems,
    deadlines,
    peopleInvolved: asStringArray(parsed.peopleInvolved),
  };
}

/**
 * Full pipeline: raw model text -> validated, schema-ready insight object.
 * @param {string} raw
 * @returns {{summary: string, decisions: string[], actionItems: object[], deadlines: object[], peopleInvolved: string[]}}
 */
function parseInsight(raw) {
  const jsonText = stripToJson(raw);
  return normalizeInsight(JSON.parse(jsonText));
}

module.exports = {
  parseInsight,
  stripToJson,
  normalizeInsight,
  extractJsonObject,
};