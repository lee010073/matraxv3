import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Profile, StoreShape } from "@/lib/types";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

let writeChain: Promise<void> = Promise.resolve();

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed || !Array.isArray(parsed.profiles)) {
      return { profiles: [] };
    }
    return parsed;
  } catch {
    return { profiles: [] };
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function withStore<T>(
  fn: (store: StoreShape) => Promise<T> | T,
): Promise<T> {
  const run = writeChain.then(async () => {
    const store = await readStore();
    const result = await fn(store);
    await writeStore(store);
    return result;
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function getProfile(id: string): Promise<Profile | null> {
  const store = await readStore();
  return store.profiles.find((profile) => profile.id === id) ?? null;
}

export async function upsertProfile(profile: Profile): Promise<Profile> {
  return withStore((store) => {
    const index = store.profiles.findIndex((row) => row.id === profile.id);
    if (index >= 0) {
      store.profiles[index] = profile;
    } else {
      store.profiles.push(profile);
    }
    return profile;
  });
}

export async function deleteProfile(id: string): Promise<void> {
  await withStore((store) => {
    store.profiles = store.profiles.filter((profile) => profile.id !== id);
  });
}
