export const PROFILE_STORAGE_KEY = "matrax.profileId";

export function readProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PROFILE_STORAGE_KEY);
}

export function writeProfileId(id: string): void {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, id);
}

export function clearProfileId(): void {
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
}
