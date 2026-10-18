/** Domain types for Matrax v3 create-flow.
 *  Shaped so they can map 1:1 onto Postgres later:
 *    profiles, categories, items, provenance, intensity, publish flag.
 */

export const CITY = "HK" as const;
export type City = typeof CITY;

export const CATEGORY_SLUGS = [
  "date-night",
  "casual",
  "solo",
  "late-night",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type ItemKind = "restaurant" | "dish";
export type ItemStatus = "draft" | "queued" | "kept" | "killed";
export type DraftProvider = "mock" | "llm";

export type Provenance = {
  sourceUrl: string;
  sourceLabel: string;
  excerpt?: string;
};

export type Category = {
  id: string;
  slug: CategorySlug;
  name: string;
  published: boolean;
};

export type TasteItem = {
  id: string;
  kind: ItemKind;
  name: string;
  venueName?: string;
  neighborhood: string;
  cuisine?: string;
  categoryId: string;
  /** 1–5. Default 4 on keep. Null until kept. */
  intensity: number | null;
  disliked: boolean;
  status: ItemStatus;
  provenance: Provenance[];
  note?: string;
  dish?: string;
  confidence: number;
};

export type Profile = {
  id: string;
  city: City;
  createdAt: string;
  updatedAt: string;
  seedUrls: string[];
  usedDemoSeed: boolean;
  draftProvider: DraftProvider;
  categories: Category[];
  items: TasteItem[];
  swipeQueue: string[];
  swipeIndex: number;
  maxSwipes: number;
};

export type StoreShape = {
  profiles: Profile[];
};

export type DraftRequest = {
  urls?: string[];
  useDemoSeed?: boolean;
};

export type DraftResponse = {
  profile: Profile;
  foundCount: number;
  swipeCount: number;
  provider: DraftProvider;
  message: string;
};

export type SwipeRequest = {
  itemId: string;
  decision: "keep" | "kill";
  intensity?: number;
};

export type PublishRequest = {
  categorySlug: CategorySlug;
  published: boolean;
};
