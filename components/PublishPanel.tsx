"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GhostButton, PrimaryButton } from "@/components/PrimaryButton";
import { CATEGORY_META, strongestCategorySlug } from "@/lib/categories";
import { fetchProfile, publishRequest } from "@/lib/client-api";
import { readProfileId } from "@/lib/session";
import type { CategorySlug, Profile } from "@/lib/types";

export function PublishPanel() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [slug, setSlug] = useState<CategorySlug>("date-night");

  useEffect(() => {
    const id = readProfileId();
    if (!id) {
      router.replace("/create");
      return;
    }
    void fetchProfile(id)
      .then((next) => {
        setProfile(next);
        setSlug(strongestCategorySlug(next.items));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load profile");
      });
  }, [router]);

  const kept = useMemo(
    () => profile?.items.filter((item) => item.status === "kept") ?? [],
    [profile],
  );
  const killed = useMemo(
    () => profile?.items.filter((item) => item.status === "killed") ?? [],
    [profile],
  );
  const inCategory = kept.filter((item) => item.categoryId === slug);
  const published = profile?.categories.find((category) => category.slug === slug)
    ?.published;

  async function toggle(nextPublished: boolean) {
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      const next = await publishRequest(profile.id, slug, nextPublished);
      setProfile(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  if (!profile) {
    return error ? <p className="text-sm text-kill">{error}</p> : <p className="text-muted">Loading…</p>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-xs uppercase tracking-[0.18em] text-accent">Done</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">Looks good.</h1>
      <p className="mt-3 text-muted">
        {kept.length} kept · {killed.length} killed (dislikes). Publish one dining
        slice — Date night or Casual is enough.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {(Object.keys(CATEGORY_META) as CategorySlug[]).map((key) => {
          const count = kept.filter((item) => item.categoryId === key).length;
          const isOn = slug === key;
          return (
            <button
              key={key}
              onClick={() => setSlug(key)}
              className={`rounded-2xl border px-4 py-3 text-left ${
                isOn ? "border-accent bg-surface-2" : "border-border bg-surface"
              }`}
            >
              <p className="font-medium">{CATEGORY_META[key].name}</p>
              <p className="mt-1 text-xs text-muted">{count} kept</p>
            </button>
          );
        })}
      </div>

      <ul className="mt-6 space-y-2">
        {inCategory.map((item) => (
          <li
            key={item.id}
            className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="text-sm">{item.name}</p>
              <p className="text-xs text-muted">
                {item.neighborhood}
                {item.intensity ? ` · ${"★".repeat(item.intensity)}` : null}
              </p>
            </div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
              {item.kind}
            </span>
          </li>
        ))}
        {inCategory.length === 0 ? (
          <li className="text-sm text-muted">
            Nothing kept in this category yet. Swipe keep, or pick another slice.
          </li>
        ) : null}
      </ul>

      {error ? <p className="mt-4 text-sm text-kill">{error}</p> : null}

      <div className="mt-8 flex flex-col gap-3">
        {published ? (
          <>
            <p className="rounded-2xl border border-keep/40 bg-keep/10 px-4 py-3 text-sm text-keep">
              Published · {CATEGORY_META[slug].name}. This slice is live.
            </p>
            <PrimaryButton
              onClick={() => router.push(`/p/${profile.id}?cat=${slug}`)}
            >
              View published slice
            </PrimaryButton>
            <GhostButton disabled={busy} onClick={() => void toggle(false)}>
              Unpublish
            </GhostButton>
          </>
        ) : (
          <PrimaryButton
            disabled={busy || inCategory.length === 0}
            onClick={() => void toggle(true)}
          >
            Publish {CATEGORY_META[slug].name}
          </PrimaryButton>
        )}
        <Link
          href="/swipe"
          className="text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to swipe
        </Link>
      </div>
    </div>
  );
}
