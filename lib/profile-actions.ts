import { getProfile, upsertProfile } from "@/lib/store";
import type { CategorySlug, Profile, SwipeRequest } from "@/lib/types";

function touch(profile: Profile): Profile {
  return { ...profile, updatedAt: new Date().toISOString() };
}

export async function applySwipe(
  profileId: string,
  body: SwipeRequest,
): Promise<Profile> {
  const profile = await getProfile(profileId);
  if (!profile) {
    throw new Error("Profile not found");
  }
  if (profile.swipeIndex >= profile.maxSwipes) {
    throw new Error("Swipe session is already complete");
  }

  const currentId = profile.swipeQueue[profile.swipeIndex];
  if (currentId !== body.itemId) {
    throw new Error("This card is not next in the queue");
  }

  const items = profile.items.map((item) => {
    if (item.id !== body.itemId) return item;
    if (body.decision === "kill") {
      return {
        ...item,
        status: "killed" as const,
        disliked: true,
        intensity: null,
      };
    }
    const intensity = clampIntensity(body.intensity ?? 4);
    return {
      ...item,
      status: "kept" as const,
      disliked: false,
      intensity,
    };
  });

  return upsertProfile(
    touch({
      ...profile,
      items,
      swipeIndex: profile.swipeIndex + 1,
    }),
  );
}

export async function publishCategory(
  profileId: string,
  slug: CategorySlug,
  published: boolean,
): Promise<Profile> {
  const profile = await getProfile(profileId);
  if (!profile) {
    throw new Error("Profile not found");
  }

  const kept = profile.items.filter((item) => item.status === "kept");
  if (published && kept.length === 0) {
    throw new Error("Keep at least one place before publishing");
  }

  const categories = profile.categories.map((category) =>
    category.slug === slug ? { ...category, published } : category,
  );

  return upsertProfile(touch({ ...profile, categories }));
}

function clampIntensity(value: number): number {
  if (!Number.isFinite(value)) return 4;
  return Math.min(5, Math.max(1, Math.round(value)));
}
