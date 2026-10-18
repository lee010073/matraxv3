import { CATEGORY_SLUGS } from "@/lib/types";
import { publishCategory } from "@/lib/profile-actions";
import type { PublishRequest } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as PublishRequest;

  if (!CATEGORY_SLUGS.includes(body.categorySlug) || typeof body.published !== "boolean") {
    return Response.json({ error: "Invalid publish payload" }, { status: 400 });
  }

  try {
    const profile = await publishCategory(id, body.categorySlug, body.published);
    return Response.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    const status = message.includes("not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
