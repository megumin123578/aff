import { NextResponse } from "next/server";
import { recordArticleOutboundLinkImpression } from "@/lib/content";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id?: unknown };
    const id = Number(body.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }
    await recordArticleOutboundLinkImpression(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
