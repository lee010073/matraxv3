"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_META, strongestCategorySlug } from "@/lib/categories";
import { fetchProfile } from "@/lib/client-api";
import type { CategorySlug, Profile } from "@/lib/types";
import { hostnameLabel } from "@/lib/urls";

export function PublishedView({ profileId }: { profileId: string }) {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchProfile(profileId)
      .then(setProfile)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Not found");
      });
  }, [profileId]);

  const slug = useMemo<CategorySlug>(() => {
    const fromQuery = searchParams.get("cat");
    if (
      fromQuery === "date-night" ||
      fromQuery === "casual" ||
      fromQuery === "solo" ||
      fromQuery === "late-night"
    ) {
      return fromQuery;
    }
    return profile ? strongestCategorySlug(profile.items) : "date-night";
  }, [profile, searchParams]);

  const category = profile?.categories.find((row) => row.slug === slug);
  const items =
    profile?.items.filter(
      (item) => item.status === "kept" && item.categoryId === slug,
    ) ?? [];

  if (error) {
    return (
      <div>
        <p className="text-kill">{error}</p>
        <Link href="/create" className="mt-4 inline-block text-sm text-accent">
          Create a taste
        </Link>
      </div>
    );
  }

  if (!profile || !category) {
    return <p className="text-muted">Loading published slice…</p>;
  }

  if (!category.published) {
    return (
      <div>
        <h1 className="font-serif text-3xl">Not published</h1>
        <p className="mt-3 text-muted">
          {CATEGORY_META[slug].name} is still private on this profile.
        </p>
        <Link href="/publish" className="mt-6 inline-block text-sm text-accent">
          Go publish
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-keep">
        Published · {profile.city} dining
      </p>
      <h1 className="mt-3 font-serif text-4xl">{CATEGORY_META[slug].name}</h1>
      <p className="mt-3 max-w-md text-muted">{CATEGORY_META[slug].blurb}</p>

      <ul className="mt-8 space-y-3">
        {items.map((item) => {
          const source = item.provenance[0];
          return (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-card px-5 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl leading-tight">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.venueName ? `${item.venueName} · ` : null}
                    {item.neighborhood}
                    {item.cuisine ? ` · ${item.cuisine}` : null}
                  </p>
                </div>
                <span className="text-accent">
                  {item.intensity ? "★".repeat(item.intensity) : ""}
                </span>
              </div>
              {item.note ? (
                <p className="mt-3 text-sm leading-6 text-foreground/85">
                  {item.note}
                </p>
              ) : null}
              {source ? (
                <p className="mt-3 text-xs text-muted">
                  Source: {source.sourceLabel}
                  {source.sourceUrl ? (
                    <>
                      {" · "}
                      <a
                        className="underline-offset-2 hover:underline"
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {hostnameLabel(source.sourceUrl)}
                      </a>
                    </>
                  ) : null}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex gap-4 text-sm text-muted">
        <Link href="/publish" className="hover:text-foreground">
          Manage publish
        </Link>
        <Link href="/create" className="hover:text-foreground">
          Start over
        </Link>
      </div>
    </div>
  );
}
