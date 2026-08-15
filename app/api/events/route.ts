import { NextResponse } from "next/server";
import { ANALYTICS_EVENTS, recordAnalyticsEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 10_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const eventName = typeof body.eventName === "string" ? body.eventName : "";
    const path = typeof body.path === "string" ? body.path : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const rawProperties = body.properties && typeof body.properties === "object" && !Array.isArray(body.properties) ? body.properties as Record<string, unknown> : {};
    if (!ANALYTICS_EVENTS.has(eventName) || !path.startsWith("/") || path.length > 500) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }
    const properties = Object.fromEntries(Object.entries(rawProperties).slice(0, 20).filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value)).map(([key, value]) => [key.slice(0, 64), typeof value === "string" ? value.slice(0, 250) : value])) as Record<string, string | number | boolean | null>;
    await recordAnalyticsEvent({ eventName, path, sessionId, properties });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }
}
