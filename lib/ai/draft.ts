import { buildProfile, mockDraft } from "@/lib/ai/mock";
import { llmDraft } from "@/lib/ai/llm";
import { upsertProfile } from "@/lib/store";
import type { DraftResponse } from "@/lib/types";
import { parseSeedUrls } from "@/lib/urls";

export async function createDraft(input: {
  rawUrls?: string;
  urls?: string[];
  useDemoSeed?: boolean;
}): Promise<DraftResponse> {
  const urls = [
    ...new Set([
      ...(input.urls ?? []),
      ...parseSeedUrls(input.rawUrls ?? ""),
    ]),
  ].slice(0, 3);

  const useDemoSeed = Boolean(input.useDemoSeed) || urls.length === 0;

  const llm = await llmDraft({ urls, useDemoSeed });
  const drafted = llm ?? mockDraft({ urls, useDemoSeed });

  const profile = await upsertProfile(
    buildProfile({
      urls,
      useDemoSeed,
      items: drafted.items,
      swipeQueue: drafted.swipeQueue,
      provider: drafted.provider,
    }),
  );

  return {
    profile,
    foundCount: profile.items.length,
    swipeCount: profile.swipeQueue.length,
    provider: profile.draftProvider,
    message: `We found ${profile.items.length} places — swipe ${profile.swipeQueue.length}.`,
  };
}
