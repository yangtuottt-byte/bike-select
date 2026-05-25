"use server";

import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BikeImportData {
  brand: string;
  model: string;
  frameMaterial: string;
  brakeSystem: string;
  price: number;
  weight?: number | null;
  groupset?: string | null;
  reachStack: Record<string, unknown>;
  specs: Record<string, unknown>;
  scenarioTags: string[];
  description?: string | null;
  image?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEEPSEEK_VISION_MODEL = process.env.DEEPSEEK_VISION_MODEL || "deepseek-chat";

/**
 * Strip markdown code-fence wrappers that LLMs sometimes emit even when
 * instructed to return raw JSON (e.g. ```json ... ``` or ``` ... ```).
 */
function stripMarkdownFences(raw: string): string {
  let cleaned = raw.trim();

  // Remove leading ```json or ``` fences
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
  // Remove trailing ``` fences
  cleaned = cleaned.replace(/\n?```\s*$/i, "");

  return cleaned.trim();
}

async function deepseekChat(
  messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }>,
): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[import] DeepSeek HTTP ${res.status} — ${res.statusText}`);
    console.error(`[import] Response body (first 500 chars):`, errBody.slice(0, 500));
    throw new Error(`DeepSeek API HTTP ${res.status} ${res.statusText}: ${errBody.slice(0, 300)}`);
  }

  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content ?? "";
  console.log(`[import] LLM rawContent (first 100 chars):`, content.slice(0, 100));
  return content;
}

async function deepseekVisionChat(base64Image: string): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            {
              type: "text",
              text: VISION_PROMPT,
            },
          ],
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[import] DeepSeek Vision HTTP ${res.status} — ${res.statusText}`);
    console.error(`[import] Response body (first 500 chars):`, errBody.slice(0, 500));
    throw new Error(`DeepSeek Vision API HTTP ${res.status} ${res.statusText}: ${errBody.slice(0, 300)}`);
  }

  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content ?? "";
  console.log(`[import] Vision rawContent (first 100 chars):`, content.slice(0, 100));
  return content;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const URL_PARSE_PROMPT = `You are a professional bike fitter. The user has submitted a bike product webpage's extracted text content. Your task is to identify and return structured data about the bike(s) described.

Return a single JSON object with the following schema. If multiple bikes are mentioned on the page, return the one most prominently featured. If a field is not found, use null.

{
  "brand": "string (the manufacturer name, e.g. Trek, Specialized, Giant)",
  "model": "string (the full model name, e.g. Emonda SL 6, Tarmac SL8)",
  "frameMaterial": "string (one of: carbon, aluminum, steel, titanium — infer from context keywords like 'carbon fiber', 'alloy', 'chromoly')",
  "brakeSystem": "string (one of: disc, rim — infer from 'disc brake', 'hydraulic disc', 'rim brake', etc.)",
  "price": number | null (in CNY if a Chinese site, otherwise in the currency listed; keep as a raw number),
  "weight": number | null (in kg, raw number only — if given in grams divide by 1000),
  "groupset": "string | null (full groupset description, e.g. 'Shimano Ultegra Di2 R8170', 'SRAM Rival eTap AXS')",
  "reachStack": {
    "reach": number | null (mm),
    "stack": number | null (mm),
    "sizes": [ { "size": "string", "reach": number, "stack": number } ] | null
  },
  "specs": {
    "frame": "string | null",
    "fork": "string | null",
    "wheelset": "string | null",
    "tires": "string | null",
    "shifters": "string | null",
    "derailleurFront": "string | null",
    "derailleurRear": "string | null",
    "crankset": "string | null",
    "cassette": "string | null",
    "brakes": "string | null",
    "handlebar": "string | null",
    "stem": "string | null",
    "seatpost": "string | null",
    "saddle": "string | null"
  },
  "scenarioTags": ["string"] (choose from: climbing, endurance, racing, gravel, triathlon, touring, commuting, aero — maximum 3 most applicable),
  "description": "string | null (a concise 1-2 sentence summary of this bike's positioning)",
  "image": "string | null (any image URL found in the content)"
}`;

const VISION_PROMPT = `You are a professional bike fitter analyzing a bicycle specification screenshot or geometry chart image. Extract all visible data into a structured JSON object.

Return a single JSON object with this exact schema:

{
  "brand": "string | null",
  "model": "string | null",
  "frameMaterial": "string | null (carbon, aluminum, steel, titanium)",
  "brakeSystem": "string | null (disc, rim)",
  "price": number | null,
  "weight": number | null,
  "groupset": "string | null",
  "reachStack": {
    "reach": number | null,
    "stack": number | null,
    "sizes": [ { "size": "string", "reach": number, "stack": number } ] | null
  },
  "specs": {
    "frame": "string | null",
    "fork": "string | null",
    "wheelset": "string | null",
    "tires": "string | null",
    "shifters": "string | null",
    "derailleurFront": "string | null",
    "derailleurRear": "string | null",
    "crankset": "string | null",
    "cassette": "string | null",
    "brakes": "string | null",
    "handlebar": "string | null",
    "stem": "string | null",
    "seatpost": "string | null",
    "saddle": "string | null"
  },
  "scenarioTags": ["string"],
  "description": "string | null",
  "image": "string | null"
}

Read every row and column carefully — especially geometry tables. If a value is unclear or missing, use null.`;

// ---------------------------------------------------------------------------
// 1. parseBikeUrlAction — Webpage URL deep extraction
// ---------------------------------------------------------------------------

export async function parseBikeUrlAction(
  url: string,
): Promise<BikeImportData> {
  if (!url) throw new Error("URL is required");

  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BikeFitBot/1.0; +https://bikefit.app)",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    html = await response.text();
  } catch (err) {
    throw new Error(
      `Network error fetching URL: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // Strip noise tags and extract clean text
  let text: string;
  try {
    const $ = cheerio.load(html);
    $("script, style, svg, footer, nav, header, noscript, iframe, meta, link").remove();
    text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);
  } catch (err) {
    throw new Error(
      `HTML parsing error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!text) throw new Error("No readable text content extracted from the page");

  // Call DeepSeek
  let raw: string;
  try {
    raw = await deepseekChat([
      { role: "system", content: URL_PARSE_PROMPT },
      { role: "user", content: text },
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[import] LLM API error — message: ${msg}`);
    if (stack) console.error(`[import] LLM API error — stack: ${stack}`);
    throw new Error(`LLM API error: ${msg}`);
  }

  // Strip markdown fences and parse JSON
  let parsed: BikeImportData;
  try {
    const clean = stripMarkdownFences(raw);
    parsed = JSON.parse(clean) as BikeImportData;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[import] JSON parse error — raw (first 200):`, raw.slice(0, 200));
    console.error(`[import] JSON parse error — message: ${msg}`);
    if (stack) console.error(`[import] JSON parse error — stack: ${stack}`);
    throw new Error(`JSON parse failed: ${msg} — raw preview: ${raw.slice(0, 300)}`);
  }

  // Coerce common string-to-number mistakes
  if (typeof parsed.price === "string") {
    parsed.price = parseFloat(parsed.price) || 0;
  }
  if (typeof parsed.weight === "string") {
    parsed.weight = parseFloat(parsed.weight) || null;
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// 2. parseBikeImageAction — Vision OCR extraction
// ---------------------------------------------------------------------------

export async function parseBikeImageAction(
  base64Image: string,
): Promise<BikeImportData> {
  if (!base64Image) throw new Error("Base64 image data is required");

  let raw: string;
  try {
    raw = await deepseekVisionChat(base64Image);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[import] Vision API error — message: ${msg}`);
    if (stack) console.error(`[import] Vision API error — stack: ${stack}`);
    throw new Error(`Vision API error: ${msg}`);
  }

  let parsed: BikeImportData;
  try {
    const clean = stripMarkdownFences(raw);
    parsed = JSON.parse(clean) as BikeImportData;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[import] Vision JSON parse error — raw (first 200):`, raw.slice(0, 200));
    console.error(`[import] Vision JSON parse error — message: ${msg}`);
    if (stack) console.error(`[import] Vision JSON parse error — stack: ${stack}`);
    throw new Error(`Vision JSON parse failed: ${msg} — raw preview: ${raw.slice(0, 300)}`);
  }

  if (typeof parsed.price === "string") {
    parsed.price = parseFloat(parsed.price) || 0;
  }
  if (typeof parsed.weight === "string") {
    parsed.weight = parseFloat(parsed.weight) || null;
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// 3. saveImportedBikesAction — Persist to database
// ---------------------------------------------------------------------------

async function resolveBrandId(name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Brand name cannot be empty");

  const existing = await prisma.brand.findUnique({ where: { name: trimmed } });
  if (existing) return existing.id;

  const created = await prisma.brand.create({
    data: { name: trimmed },
  });
  return created.id;
}

export async function saveImportedBikesAction(
  bikes: BikeImportData[],
): Promise<{ count: number; ids: string[] }> {
  if (!bikes || bikes.length === 0) throw new Error("No bike data provided");

  const ids: string[] = [];

  for (const bike of bikes) {
    if (!bike.brand || !bike.model) {
      throw new Error(`Each bike must have at least "brand" and "model"`);
    }

    const brandId = await resolveBrandId(bike.brand);

    const created = await prisma.bike.create({
      data: {
        model: bike.model,
        brandId,
        frameMaterial: bike.frameMaterial || "carbon",
        brakeSystem: bike.brakeSystem || "disc",
        price: bike.price ?? 0,
        weight: bike.weight ?? null,
        groupset: bike.groupset ?? null,
        reachStack: JSON.stringify(bike.reachStack ?? {}),
        specs: JSON.stringify(bike.specs ?? {}),
        scenarioTags: JSON.stringify(bike.scenarioTags ?? []),
        description: bike.description ?? null,
        image: bike.image ?? null,
      },
    });

    ids.push(created.id);
  }

  return { count: ids.length, ids };
}
