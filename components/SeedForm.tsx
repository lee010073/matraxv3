"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GhostButton, PrimaryButton } from "@/components/PrimaryButton";
import { createDraftRequest } from "@/lib/client-api";
import { SAMPLE_SEED_URLS } from "@/lib/seed-data";
import { writeProfileId } from "@/lib/session";
import { parseSeedUrls } from "@/lib/urls";

const STEPS = [
  "Reading sources",
  "Normalizing places",
  "Ranking 10 to swipe",
] as const;

export function SeedForm() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);

  async function draft(useDemoSeed: boolean) {
    setError(null);
    const urls = useDemoSeed ? [] : parseSeedUrls(raw);
    if (!useDemoSeed && urls.length === 0) {
      setError("Paste at least one link, or use the HK famous lists.");
      return;
    }

    setBusy(true);
    setStep(0);
    const tick = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }, 280);

    try {
      const result = await createDraftRequest({ urls, useDemoSeed });
      writeProfileId(result.profile.id);
      router.push("/swipe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draft taste");
      setBusy(false);
    } finally {
      window.clearInterval(tick);
    }
  }

  if (busy) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-6">
        <p className="font-serif text-3xl">Drafting your HK taste…</p>
        <ol className="space-y-3 text-sm">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className={index <= step ? "text-foreground" : "text-muted"}
            >
              {index < step ? "✓" : index === step ? "→" : "·"} {label}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-xs uppercase tracking-[0.18em] text-accent">Phase A</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight">
        Seed your food taste
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Paste 1–3 dining links. Or skip and we&apos;ll draft from Hong Kong
        famous lists. No blank form.
      </p>

      <label className="mt-8 text-sm text-muted" htmlFor="seeds">
        Links (OpenRice, Time Out, Michelin, Maps…)
      </label>
      <textarea
        id="seeds"
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        placeholder={SAMPLE_SEED_URLS.join("\n")}
        rows={5}
        className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground outline-none ring-accent/40 placeholder:text-muted/60 focus:ring-2"
      />

      {error ? <p className="mt-3 text-sm text-kill">{error}</p> : null}

      <div className="mt-6 flex flex-col gap-3">
        <PrimaryButton onClick={() => void draft(false)}>
          Draft from these links
        </PrimaryButton>
        <GhostButton onClick={() => void draft(true)}>
          Skip — use HK famous lists
        </GhostButton>
      </div>

      <p className="mt-8 text-xs leading-5 text-muted">
        Connect OpenRice / Maps / IG saves is later. This slice is paste or
        demo seed → swipe 10 → publish one category.
      </p>
    </div>
  );
}
