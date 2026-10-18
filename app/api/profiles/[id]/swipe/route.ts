import { applySwipe } from "@/lib/profile-actions";
import type { SwipeRequest } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as SwipeRequest;

  if (!body.itemId || (body.decision !== "keep" && body.decision !== "kill")) {
    return Response.json({ error: "Invalid swipe" }, { status: 400 });
  }

  try {
    const profile = await applySwipe(id, body);
    return Response.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Swipe failed";
    const status = message.includes("not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
