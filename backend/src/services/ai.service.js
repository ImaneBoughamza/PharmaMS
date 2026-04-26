import Anthropic from "@anthropic-ai/sdk";
import { ApiError } from "../utils/ApiError.js";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a helpful pharmacy assistant embedded in a pharmacy management system.
When given symptoms, a medication name, or a brief description, suggest appropriate over-the-counter (OTC) medicines.
For each suggestion include: medicine name, typical dosage, when to use it, and any important warnings.
Always end your response with a clear disclaimer: "This information is for pharmacist reference only. Always verify with the prescribing pharmacist before dispensing."
Keep responses concise and structured.`;

/**
 * Get OTC medicine suggestions from Claude.
 * @param {string} prompt - Symptoms or free-text input from staff
 * @returns {string} - Claude's response text
 */
export async function getOTCSuggestion(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ApiError(503, "AI service not configured (ANTHROPIC_API_KEY missing)");
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return message.content[0].text;
}
