import { randomUUID } from "node:crypto";
import { makeCategories } from "@/lib/categories";
import { HK_PLACES, type SeedPlace } from "@/lib/seed-data";
import type { DraftProvider, Profile, Provenance, TasteItem } from "@/lib/types";
import {
  classifySource,
  sourceDisplayName,
  type SourceKind,
} from "@/lib/urls";

const MAX_SWIPES = 10;
const TARGET_DRAFT = 20;

const SOURCE_TAG: Record<SourceKind, string[]> = {
  openrice: ["openrice", "casual", "noodles", "cha-chaan-teng"],
  timeout: ["timeout", "date", "instagram", "soho"],
  michelin: ["michelin", "date", "fine", "cantonese"],
  instagram: ["instagram", "date", "soho", "bao"],
  maps: ["casual", "openrice", "noodles"],
  generic: ["casual", "date"],
};

function scorePlace(place: SeedPlace, kinds: SourceKind[]): number {
  if (kinds.length === 0) {
    return place.confidence;
  }
  let bonus = 0;
  for (const kind of kinds) {
    const tags = SOURCE_TAG[kind];
    const hits = place.tags.filter((tag) => tags.includes(tag)).length;
    bonus += hits * 0.04;
    if (place.provenanceLabel.toLowerCase().includes(kind)) {
      bonus += 0.08;
    }
  }
  return Math.min(0.99, place.confidence + bonus);
}

function provenanceFor(
  place: SeedPlace,
  urls: string[],
  kinds: SourceKind[],
): Provenance[] {
  if (urls.length === 0) {
    return [
      {
        sourceUrl: place.provenanceUrl,
        sourceLabel: place.provenanceLabel,
        excerpt: "HK famous-list seed",
      },
    ];
  }

  const matched = urls
    .map((url, index) => ({ url, kind: kinds[index] }))
    .filter(({ kind }) => {
      const tags = SOURCE_TAG[kind];
      return place.tags.some((tag) => tags.includes(tag));
    });

  const sources = matched.length > 0 ? matched : [{ url: urls[0], kind: kinds[0] }];
  return sources.slice(0, 2).map(({ url, kind }) => ({
    sourceUrl: url,
    sourceLabel: sourceDisplayName(kind, url),
    excerpt: `Extracted from ${sourceDisplayName(kind, url)}`,
  }));
}

function toItem(
  place: SeedPlace,
  urls: string[],
  kinds: SourceKind[],
  confidence: number,
): TasteItem {
  return {
    id: randomUUID(),
    kind: place.kind,
    name: place.name,
    venueName: place.venueName,
    neighborhood: place.neighborhood,
    cuisine: place.cuisine,
    categoryId: place.category,
    intensity: null,
    disliked: false,
    status: "draft",
    provenance: provenanceFor(place, urls, kinds),
    note: place.note,
    dish: place.dish,
    confidence,
  };
}

function diversifyQueue(items: TasteItem[], limit: number): string[] {
  const byCategory = new Map<string, TasteItem[]>();
  for (const item of items) {
    const list = byCategory.get(item.categoryId) ?? [];
    list.push(item);
    byCategory.set(item.categoryId, list);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => b.confidence - a.confidence);
  }

  const queue: TasteItem[] = [];
  const used = new Set<string>();
  const order = ["date-night", "casual", "late-night", "solo"];
  while (queue.length < limit) {
    let added = false;
    for (const slug of order) {
      const next = (byCategory.get(slug) ?? []).find(
        (item) => !used.has(item.id),
      );
      if (next) {
        queue.push(next);
        used.add(next.id);
        added = true;
        if (queue.length >= limit) break;
      }
    }
    if (!added) break;
  }
  return queue.map((item) => item.id);
}

export function mockDraft(input: {
  urls: string[];
  useDemoSeed: boolean;
}): {
  items: TasteItem[];
  swipeQueue: string[];
  provider: DraftProvider;
} {
  const urls = input.urls.slice(0, 3);
  const kinds = urls.map(classifySource);
  const ranked = HK_PLACES.map((place) => ({
    place,
    score: scorePlace(place, kinds),
  })).sort((a, b) => b.score - a.score);

  const items = ranked
    .slice(0, TARGET_DRAFT)
    .map(({ place, score }) => toItem(place, urls, kinds, score));

  const swipeQueue = diversifyQueue(items, MAX_SWIPES);
  for (const item of items) {
    item.status = swipeQueue.includes(item.id) ? "queued" : "draft";
  }

  return { items, swipeQueue, provider: "mock" };
}

export function newProfileId(): string {
  return randomUUID();
}

export function buildProfile(input: {
  urls: string[];
  useDemoSeed: boolean;
  items: TasteItem[];
  swipeQueue: string[];
  provider: DraftProvider;
}): Profile {
  const now = new Date().toISOString();
  return {
    id: newProfileId(),
    city: "HK",
    createdAt: now,
    updatedAt: now,
    seedUrls: input.urls,
    usedDemoSeed: input.useDemoSeed,
    draftProvider: input.provider,
    categories: makeCategories(),
    items: input.items,
    swipeQueue: input.swipeQueue,
    swipeIndex: 0,
    maxSwipes: MAX_SWIPES,
  };
}
