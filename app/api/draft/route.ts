import { createDraft } from "@/lib/ai/draft";
import type { DraftRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DraftRequest;
  const urls = Array.isArray(body.urls)
    ? body.urls.filter((url) => typeof url === "string")
    : [];

  const result = await createDraft({
    urls,
    useDemoSeed: Boolean(body.useDemoSeed) || urls.length === 0,
  });

  return Response.json(result);
}
