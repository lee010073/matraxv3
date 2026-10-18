import type {
  CategorySlug,
  DraftResponse,
  Profile,
} from "@/lib/types";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export async function createDraftRequest(input: {
  urls: string[];
  useDemoSeed: boolean;
}): Promise<DraftResponse> {
  const response = await fetch("/api/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<DraftResponse>(response);
}

export async function fetchProfile(id: string): Promise<Profile> {
  const response = await fetch(`/api/profiles/${id}`, { cache: "no-store" });
  const data = await parseJson<{ profile: Profile }>(response);
  return data.profile;
}

export async function swipeRequest(
  profileId: string,
  body: { itemId: string; decision: "keep" | "kill"; intensity?: number },
): Promise<Profile> {
  const response = await fetch(`/api/profiles/${profileId}/swipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson<{ profile: Profile }>(response);
  return data.profile;
}

export async function publishRequest(
  profileId: string,
  categorySlug: CategorySlug,
  published: boolean,
): Promise<Profile> {
  const response = await fetch(`/api/profiles/${profileId}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categorySlug, published }),
  });
  const data = await parseJson<{ profile: Profile }>(response);
  return data.profile;
}

export async function resetProfile(id: string): Promise<void> {
  await fetch(`/api/profiles/${id}`, { method: "DELETE" });
}
