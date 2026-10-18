import type { DraftProvider, TasteItem } from "@/lib/types";
import { HK_PLACES } from "@/lib/seed-data";
import { mockDraft } from "@/lib/ai/mock";

/**
 * Optional real LLM draft. Plug in later with:
 *   OPENAI_API_KEY=...  or  AI_GATEWAY_API_KEY=...
 * and (optionally) AI_MODEL=openai/gpt-5.4
 *
 * Uses the AI SDK generateText + Output.object pattern when available.
 * Any failure falls back to the mock so the demo never blocks on a key.
 */
export function hasLlmCredentials(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY ||
      process.env.AI_GATEWAY_API_KEY ||
      process.env.AI_GATEWAY_APIKEY,
  );
}

export async function llmDraft(input: {
  urls: string[];
  useDemoSeed: boolean;
}): Promise<{
  items: TasteItem[];
  swipeQueue: string[];
  provider: DraftProvider;
} | null> {
  if (!hasLlmCredentials()) return null;

  try {
    const { generateText, Output } = await import("ai");
    const { z } = await import("zod");

    const catalog = HK_PLACES.map((place) => ({
      key: place.key,
      name: place.name,
      neighborhood: place.neighborhood,
      kind: place.kind,
      category: place.category,
      note: place.note,
    }));

    const schema = z.object({
      keys: z.array(z.string()).min(8).max(24),
    });

    const model = process.env.AI_MODEL || "openai/gpt-5.4";
    const { output } = await generateText({
      model,
      output: Output.object({ schema }),
      prompt: [
        "You are drafting a Hong Kong dining taste profile.",
        "Pick 16-20 places from the catalog that best match the seed URLs.",
        "Prefer restaurants implied by the sources; keep a mix of Date night and Casual.",
        `Seed URLs: ${input.urls.join(", ") || "(city famous lists)"}`,
        `Catalog JSON: ${JSON.stringify(catalog)}`,
        "Return { keys: string[] } using catalog keys only.",
      ].join("\n"),
    });

    const keys = new Set(output?.keys ?? []);
    if (keys.size < 8) return null;

    const filtered = mockDraft(input);
    const preferred = filtered.items.filter((item) => {
      const place = HK_PLACES.find(
        (row) => row.name === item.name || row.dish === item.name,
      );
      return place ? keys.has(place.key) : false;
    });

    if (preferred.length < 8) return null;

    return {
      ...filtered,
      items: preferred.length >= 12 ? preferred : filtered.items,
      provider: "llm",
    };
  } catch (error) {
    console.warn("[matrax] LLM draft failed; using mock.", error);
    return null;
  }
}
