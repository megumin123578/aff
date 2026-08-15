import { NextResponse } from "next/server";
import { getAffiliateLink, recordAffiliateClick } from "@/lib/content";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await getAffiliateLink(id);
  const incoming = new URL(request.url);

  if (!link?.enabled) {
    return NextResponse.redirect(new URL("/affiliate-disclosure?link=unavailable", incoming), 307);
  }

  try {
    const destination = new URL(link.affiliateUrl || link.destinationUrl);
    if (!['http:', 'https:'].includes(destination.protocol)) throw new Error("Unsupported protocol");
    destination.searchParams.set("utm_source", "neroviax");
    destination.searchParams.set("utm_medium", "affiliate");
    destination.searchParams.set("utm_campaign", incoming.searchParams.get("source") || "website");
    const plan = incoming.searchParams.get("plan");
    if (plan) destination.searchParams.set("utm_content", plan);

    await recordAffiliateClick({
      affiliateId: link.id,
      source: incoming.searchParams.get("source") || "unknown",
      articleSlug: incoming.searchParams.get("article") || undefined,
      planId: plan || undefined,
      placement: incoming.searchParams.get("placement") || undefined,
    }).catch((error: unknown) => console.error("affiliate_click_failed", error));
    return NextResponse.redirect(destination, 307);
  } catch {
    return NextResponse.redirect(new URL("/affiliate-disclosure?link=invalid", incoming), 307);
  }
}
