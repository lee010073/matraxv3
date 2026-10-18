# Matrax v3 — HK dining taste (create slice)

Demo of the **lowest-friction create journey**: seed → AI draft → 10-swipe confirm → publish one dining category.

This repo does **not** include follow graph, ask/chat, MCP, or monetization.

## What you can do

1. Paste 1–3 dining links **or** skip and use Hong Kong famous-list seed data.
2. See an AI / mock draft of restaurants and dishes (with provenance).
3. Swipe keep / kill on up to 10 cards. Optional intensity stars on keep (default 4). Kill stores a dislike.
4. Publish one category (Date night, Casual, Solo, or Late night) and view the published slice.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and tap **Create my food taste**.

No API key is required. The demo uses a curated HK restaurant catalog (`lib/seed-data.ts`) so the UX is always demoable.

### Optional real LLM draft

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` or `AI_GATEWAY_API_KEY`. `lib/ai/llm.ts` runs first when a key is present and falls back to the mock on any error.

## Stack

- Next.js App Router + TypeScript + Tailwind
- Local JSON store at `data/store.json` (created at runtime)
- Schema ready for Postgres: profiles, categories, items, provenance, intensity, publish flag (`lib/types.ts`)

## Routes

| Path | Step |
| --- | --- |
| `/` | Start |
| `/create` | Seed links or HK demo seed |
| `/swipe` | 10 keep/kill cards |
| `/publish` | Publish one category |
| `/p/[profileId]` | Public published slice |
