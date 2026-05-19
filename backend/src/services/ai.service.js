import Anthropic from "@anthropic-ai/sdk";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ANTHROPIC_PRESCRIPTION_MODEL =
  process.env.ANTHROPIC_PRESCRIPTION_MODEL || "claude-sonnet-4-20250514";
const ANTHROPIC_OTC_MODEL = process.env.ANTHROPIC_OTC_MODEL || "claude-haiku-4-5-20251001";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-2.0-flash,gemini-1.5-flash")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const GEMINI_MODELS = [...new Set([GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS])];

const getProvider = () =>
  (process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "anthropic")).toLowerCase();

const parseJsonResponse = (rawText, fallbackMessage) => {
  try {
    const clean = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    logger.error(`AI response parse failed: ${rawText}`);
    throw ApiError.internal(fallbackMessage);
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientGeminiError = (status, message = "") => {
  const text = message.toLowerCase();
  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    text.includes("high demand") ||
    text.includes("overloaded") ||
    text.includes("temporarily") ||
    text.includes("try again")
  );
};

const callGeminiModel = async ({ model, systemPrompt, userPrompt, image, json = true }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw ApiError.internal("AI service not configured (GEMINI_API_KEY missing)");
  }

  const parts = [];
  if (image) {
    parts.push({
      inlineData: {
        mimeType: image.mediaType,
        data: image.base64Image,
      },
    });
  }
  parts.push({ text: userPrompt });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.2,
          ...(json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error?.message || response.statusText || "Gemini API request failed";
    const error = ApiError.internal(`Gemini API error: ${message}`);
    error.provider = "gemini";
    error.model = model;
    error.responseStatus = response.status;
    error.transient = isTransientGeminiError(response.status, message);
    throw error;
  }

  const text = (payload.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();

  if (!text) {
    throw ApiError.internal("Gemini returned an empty response - please try again");
  }

  return text;
};

const callGemini = async ({ systemPrompt, userPrompt, image, json = true }) => {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        if (attempt > 1) {
          await wait(700 * attempt);
        }
        return await callGeminiModel({ model, systemPrompt, userPrompt, image, json });
      } catch (err) {
        lastError = err;
        logger.warn(
          `Gemini ${model} attempt ${attempt} failed: ${err.message}`
        );
        if (!err.transient) break;
      }
    }
  }

  throw lastError || ApiError.internal("Gemini API request failed");
};

const callPreferredProvider = async ({
  systemPrompt,
  userPrompt,
  image,
  anthropicModel,
  json = true,
  maxTokens = 1024,
}) => {
  const provider = getProvider();

  if (provider === "gemini") {
    try {
      return await callGemini({ systemPrompt, userPrompt, image, json });
    } catch (err) {
      if (process.env.ANTHROPIC_API_KEY && err.transient !== false) {
        logger.warn(`Gemini unavailable, falling back to Anthropic: ${err.message}`);
        return callAnthropic({
          systemPrompt,
          userPrompt,
          image,
          model: anthropicModel,
          maxTokens,
        });
      }
      throw err;
    }
  }

  try {
    return await callAnthropic({
      systemPrompt,
      userPrompt,
      image,
      model: anthropicModel,
      maxTokens,
    });
  } catch (err) {
    if (process.env.GEMINI_API_KEY) {
      logger.warn(`Anthropic unavailable, falling back to Gemini: ${err.message}`);
      return callGemini({ systemPrompt, userPrompt, image, json });
    }
    throw err;
  }
};

const callAnthropic = async ({ systemPrompt, userPrompt, image, model, maxTokens = 1024 }) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw ApiError.internal("AI service not configured (ANTHROPIC_API_KEY missing)");
  }

  const content = image
    ? [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: image.mediaType,
            data: image.base64Image,
          },
        },
        { type: "text", text: userPrompt },
      ]
    : userPrompt;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content }],
    system: systemPrompt,
  });

  return response.content?.[0]?.text || "";
};

export const extractPrescriptionMedicines = async (
  base64Image,
  mediaType,
  patientNotes = ""
) => {
  const systemPrompt = `You are an AI assistant supporting a licensed pharmacist in Morocco.
Your role is to read prescription images and extract the prescribed medicine names.

STRICT RULES:
- Extract the list of prescribed medicines from the image
- Do not infer medicines that are not visible or reasonably legible
- Respond ONLY in valid JSON - no markdown, no extra text`;

  const userPrompt = `Analyse this prescription image.
${patientNotes ? `Patient notes: ${patientNotes}` : ""}

Respond with this exact JSON structure:
{
  "extractedMedicines": [
    { "name": "medicine name as written on prescription" }
  ]
}`;

  const rawText = await callPreferredProvider({
    systemPrompt,
    userPrompt,
    image: { base64Image, mediaType },
    anthropicModel: ANTHROPIC_PRESCRIPTION_MODEL,
  });

  const parsed = parseJsonResponse(
    rawText,
    "AI returned an unparseable response - please try again"
  );

  return parsed.extractedMedicines || [];
};

export const generateComplementaryRecommendations = async (
  medicines,
  pharmacyId,
  patientNotes = ""
) => {
  const inStockProducts = await ParapharmacyProduct.find({
    pharmacyId,
    isActive: true,
    stockQty: { $gt: 0 },
  }).select("_id name brand category salePrice stockQty");

  const productCatalogue = inStockProducts
    .map(
      (product) =>
        `ID:${product._id} | ${product.name} | ${product.brand || ""} | ` +
        `${product.category} | ${product.salePrice} MAD | stock ${product.stockQty}`
    )
    .join("\n");

  const systemPrompt = `You are an AI assistant supporting a licensed pharmacist in Morocco.
Your role is to suggest complementary parapharmacy products based on verified prescribed medicines.

STRICT RULES:
- Suggest ONLY vitamins, dietary supplements, probiotics, clinically relevant skincare,
  and medical devices that complement the prescribed treatment
- NEVER suggest OTC medicines, prescription medicines, or products that could
  modify, replace, or interact with the prescribed treatment
- ONLY suggest products from the provided in-stock catalogue
- Provide a brief clinical rationale for each suggestion
- If no relevant products are in the catalogue, return an empty suggestions array
- Respond ONLY in valid JSON - no markdown, no extra text`;

  const userPrompt = `Verified prescribed medicines:
${medicines.map((medicine) => `- ${medicine.name || medicine}`).join("\n")}
${patientNotes ? `\nPatient notes: ${patientNotes}` : ""}

In-stock parapharmacy catalogue:
${productCatalogue || "No parapharmacy products currently in stock"}

Respond with this exact JSON structure:
{
  "suggestions": [
    {
      "productId": "the ID from the catalogue (after 'ID:')",
      "rationale": "brief clinical reason why this product complements the treatment"
    }
  ]
}`;

  const rawText = await callPreferredProvider({
    systemPrompt,
    userPrompt,
    anthropicModel: ANTHROPIC_PRESCRIPTION_MODEL,
  });

  const parsed = parseJsonResponse(
    rawText,
    "AI returned unparseable recommendations - please try again"
  );

  const enrichedSuggestions = (parsed.suggestions || [])
    .map((suggestion) => {
      const product = inStockProducts.find(
        (candidate) => candidate._id.toString() === suggestion.productId
      );

      if (!product) return null;

      return {
        productId: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        salePrice: product.salePrice,
        stockQty: product.stockQty,
        rationale: suggestion.rationale,
      };
    })
    .filter(Boolean);

  logger.info(
    `AI complementary recommendations complete - ${enrichedSuggestions.length} suggestions generated`
  );

  return enrichedSuggestions;
};

/**
 * Compatibility helper: analyse an image, then immediately generate
 * complementary suggestions from the extracted medicine names.
 */
export const analysePrescription = async (
  base64Image,
  mediaType,
  pharmacyId,
  patientNotes = ""
) => {
  const extractedMedicines = await extractPrescriptionMedicines(
    base64Image,
    mediaType,
    patientNotes
  );
  const suggestions = await generateComplementaryRecommendations(
    extractedMedicines,
    pharmacyId,
    patientNotes
  );

  return { extractedMedicines, suggestions };
};

// Compatibility for the existing /api/ai route. New AI controllers should call
// analysePrescription for prescription scans.
export const getOTCSuggestion = async (prompt) => {
  const systemPrompt = `You are a helpful pharmacy assistant embedded in a pharmacy management system.
When given symptoms, a medication name, or a brief description, suggest appropriate over-the-counter (OTC) medicines.
For each suggestion include: medicine name, typical dosage, when to use it, and any important warnings.
Always end your response with a clear disclaimer: "This information is for pharmacist reference only. Always verify with the prescribing pharmacist before dispensing."
Keep responses concise and structured.`;

  if (getProvider() === "gemini") {
    return callPreferredProvider({
      systemPrompt,
      userPrompt: prompt,
      anthropicModel: ANTHROPIC_OTC_MODEL,
      json: false,
    });
  }

  return callPreferredProvider({
    systemPrompt,
    userPrompt: prompt,
    anthropicModel: ANTHROPIC_OTC_MODEL,
    json: false,
  });
};

export default {
  analysePrescription,
  extractPrescriptionMedicines,
  generateComplementaryRecommendations,
  getOTCSuggestion,
};
