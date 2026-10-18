"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TasteCard } from "@/components/TasteCard";
import { fetchProfile, swipeRequest } from "@/lib/client-api";
import { readProfileId } from "@/lib/session";
import type { Profile, TasteItem } from "@/lib/types";

const THRESHOLD = 90;

export function SwipeDeck() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingKeep, setPendingKeep] = useState<TasteItem | null>(null);

  useEffect(() => {
    const id = readProfileId();
    if (!id) {
      router.replace("/create");
      return;
    }
    void fetchProfile(id)
      .then((next) => {
        setProfile(next);
        if (next.swipeIndex >= next.maxSwipes) {
          router.replace("/publish");
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load draft");
      });
  }, [router]);

  const current = useMemo(() => {
    if (!profile) return null;
    const id = profile.swipeQueue[profile.swipeIndex];
    return profile.items.find((item) => item.id === id) ?? null;
  }, [profile]);

  const upcoming = useMemo(() => {
    if (!profile) return [];
    return profile.swipeQueue
      .slice(profile.swipeIndex, profile.swipeIndex + 3)
      .map((id) => profile.items.find((item) => item.id === id))
      .filter((item): item is TasteItem => Boolean(item));
  }, [profile]);

  const finishIfDone = useCallback(
    (next: Profile) => {
      setProfile(next);
      if (next.swipeIndex >= next.maxSwipes) {
        router.push("/publish");
      }
    },
    [router],
  );

  const decide = useCallback(
    async (decision: "keep" | "kill", intensity?: number) => {
      if (!profile || !current || busy) return;
      setBusy(true);
      setDx(decision === "keep" ? 160 : -160);
      try {
        const next = await swipeRequest(profile.id, {
          itemId: current.id,
          decision,
          intensity,
        });
        setPendingKeep(null);
        setDx(0);
        finishIfDone(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Swipe failed");
        setDx(0);
      } finally {
        setBusy(false);
      }
    },
    [busy, current, finishIfDone, profile],
  );

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (pendingKeep || busy) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDx((currentDx) => currentDx + event.movementX);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dx > THRESHOLD) {
      setPendingKeep(current);
      setDx(0);
      return;
    }
    if (dx < -THRESHOLD) {
      void decide("kill");
      return;
    }
    setDx(0);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (pendingKeep) {
        if (event.key >= "1" && event.key <= "5") {
          void decide("keep", Number(event.key));
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void decide("keep", 4);
        }
        if (event.key === "Escape") {
          setPendingKeep(null);
        }
        return;
      }
      if (event.key === "ArrowRight") setPendingKeep(current);
      if (event.key === "ArrowLeft") void decide("kill");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, decide, pendingKeep]);

  if (error) {
    return <p className="text-sm text-kill">{error}</p>;
  }

  if (!profile || !current) {
    return <p className="text-muted">Loading draft…</p>;
  }

  const remaining = profile.maxSwipes - profile.swipeIndex;
  const rotation = Math.max(-12, Math.min(12, dx / 14));

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Phase B · {profile.swipeIndex}/{profile.maxSwipes}
          </p>
          <h1 className="mt-2 font-serif text-3xl">Swipe {remaining} left</h1>
          <p className="mt-1 text-sm text-muted">
            We found {profile.items.length} places. Keep or kill — max 10.
          </p>
        </div>
        <button
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => router.push("/publish")}
        >
          Looks good
        </button>
      </div>

      <div
        className="relative mt-6 h-[420px] w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {upcoming
          .slice()
          .reverse()
          .map((item, reverseIndex) => {
            const offset = upcoming.length - 1 - reverseIndex;
            const isTop = offset === 0;
            return (
              <div
                key={item.id}
                className="absolute inset-0"
                style={{
                  zIndex: 20 - offset,
                  transform: isTop
                    ? `translateX(${dx}px) rotate(${rotation}deg)`
                    : undefined,
                  transition: isTop && !dragging ? "transform 180ms ease" : "none",
                }}
              >
                <TasteCard item={item} offset={offset} />
                {isTop && dx > 24 ? (
                  <Stamp label="KEEP" className="border-keep text-keep left-6" />
                ) : null}
                {isTop && dx < -24 ? (
                  <Stamp label="KILL" className="border-kill text-kill right-6" />
                ) : null}
              </div>
            );
          })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          aria-label="Kill"
          disabled={busy || Boolean(pendingKeep)}
          onClick={() => void decide("kill")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-kill/40 text-kill transition hover:bg-kill/10 disabled:opacity-40"
        >
          ✕
        </button>
        <button
          aria-label="Keep"
          disabled={busy || Boolean(pendingKeep)}
          onClick={() => setPendingKeep(current)}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-keep/40 text-keep transition hover:bg-keep/10 disabled:opacity-40"
        >
          ✓
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Drag, buttons, or ← / →. Kill is a dislike.
      </p>

      {pendingKeep ? (
        <IntensitySheet
          name={pendingKeep.name}
          onSkip={() => void decide("keep", 4)}
          onPick={(value) => void decide("keep", value)}
          onCancel={() => setPendingKeep(null)}
        />
      ) : null}
    </div>
  );
}

function Stamp({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute top-8 rounded-md border-2 px-3 py-1 text-sm font-semibold tracking-[0.2em] ${className}`}
    >
      {label}
    </div>
  );
}

function IntensitySheet({
  name,
  onSkip,
  onPick,
  onCancel,
}: {
  name: string;
  onSkip: () => void;
  onPick: (value: number) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/55 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Optional intensity
        </p>
        <h2 className="mt-2 font-serif text-2xl">How much is {name}?</h2>
        <p className="mt-2 text-sm text-muted">
          Skip uses ★★★★. This is skippable on purpose.
        </p>
        <div className="mt-6 flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => onPick(value)}
              className="flex h-12 flex-1 flex-col items-center justify-center rounded-2xl border border-border bg-card text-accent hover:border-accent"
              aria-label={`${value} stars`}
            >
              <span className="text-lg leading-none">★</span>
              <span className="mt-1 text-[11px] text-muted">{value}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="h-11 flex-1 rounded-full border border-border text-sm text-muted"
          >
            Back
          </button>
          <button
            onClick={onSkip}
            className="h-11 flex-1 rounded-full bg-accent text-sm font-medium text-accent-ink"
          >
            Skip · default 4
          </button>
        </div>
      </div>
    </div>
  );
}
