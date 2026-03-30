import OpenAI from "openai";

export function hasOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && String(key).trim());
}

/**
 * Chat completion via official OpenAI SDK.
 * @param {{ system?: string; user: string; model?: string }} opts
 * @returns {Promise<string>}
 */
export async function runOpenAIChat({ system, user, model = "gpt-4o-mini" }) {
  if (!hasOpenAIKey()) {
    const err = new Error("OpenAI API key is not configured.");
    err.code = "OPENAI_API_KEY_MISSING";
    throw err;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  /** @type {import("openai").ChatCompletionMessageParam[]} */
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: user });

  const response = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 4096,
  });

  const text = response.choices?.[0]?.message?.content;
  return typeof text === "string" ? text.trim() : "";
}
