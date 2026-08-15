import { NextResponse } from "next/server";
import { getVpsPlans } from "@/lib/catalog";
import { criteriaForConfiguration, matchProviderPlans } from "@/lib/providers";
import { saveRecommendation } from "@/lib/recommendations";
import { estimateServer, validateWorkload, workloadFromSearchParams } from "@/lib/selector";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 10_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  try {
    const body = await request.json() as { query?: unknown };
    if (typeof body.query !== "string" || body.query.length > 5000) return NextResponse.json({ error: "Invalid workload" }, { status: 400 });
    const workload = workloadFromSearchParams(new URLSearchParams(body.query));
    const validation = validateWorkload(workload);
    if (validation.errors.length) return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    const estimate = estimateServer(workload);
    const plans = await getVpsPlans();
    const matchedPlanSlugs = matchProviderPlans(estimate.recommended, plans, criteriaForConfiguration(workload, estimate.recommended)).map((match) => match.plan.slug);
    const shareId = await saveRecommendation({ formulaVersion: estimate.formulaVersion, workload, minimum: estimate.minimum, recommended: estimate.recommended, matchedPlanSlugs });
    return NextResponse.json({ shareId, url: `/recommendations/${shareId}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save recommendation" }, { status: 400 });
  }
}
