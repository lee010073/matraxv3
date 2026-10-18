import type { Category, CategorySlug } from "@/lib/types";

export const CATEGORY_META: Record<
  CategorySlug,
  { name: string; blurb: string }
> = {
  "date-night": {
    name: "Date night",
    blurb: "Rooms you’d book for someone you like.",
  },
  casual: {
    name: "Casual",
    blurb: "Noodles, cafes, and everyday HK hits.",
  },
  solo: {
    name: "Solo",
    blurb: "Counter seats and one-person bowls.",
  },
  "late-night": {
    name: "Late night",
    blurb: "Open when the MTR has already stopped.",
  },
};

export function makeCategories(): Category[] {
  return (Object.keys(CATEGORY_META) as CategorySlug[]).map((slug) => ({
    id: slug,
    slug,
    name: CATEGORY_META[slug].name,
    published: false,
  }));
}

export function strongestCategorySlug(
  items: { categoryId: string; status: string }[],
): CategorySlug {
  const kept = items.filter((item) => item.status === "kept");
  const counts = new Map<string, number>();
  for (const item of kept) {
    counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
  }
  const ranked: CategorySlug[] = [
    "date-night",
    "casual",
    "late-night",
    "solo",
  ];
  let best: CategorySlug = "date-night";
  let bestCount = -1;
  for (const slug of ranked) {
    const count = counts.get(slug) ?? 0;
    if (count > bestCount) {
      best = slug;
      bestCount = count;
    }
  }
  return best;
}
