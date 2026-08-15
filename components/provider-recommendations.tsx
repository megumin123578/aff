"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import {
  matchProviderPlans,
  criteriaForConfiguration,
  type MatchKind,
} from "@/lib/providers";
import type { CatalogPlan } from "@/lib/catalog-types";
import type { ServerEstimate, Workload } from "@/lib/selector";
import { trackEvent } from "@/lib/client-analytics";

type Props = {
  estimate: ServerEstimate;
  isLoading: boolean;
  resultVersion: number;
  plans: CatalogPlan[];
  workload: Workload;
};

const badgeVariant: Record<MatchKind, "default" | "azure" | "mint"> = {
  "lowest-price": "mint",
  "best-value": "azure",
  "more-headroom": "default",
};

function PlanSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="skeleton h-6 w-28 rounded-full" />
        <span className="skeleton size-10 rounded-xl" />
      </div>
      <span className="skeleton mt-6 block h-7 w-36 rounded-lg" />
      <span className="skeleton mt-3 block h-12 w-full rounded-xl" />
      <span className="skeleton mt-5 block h-11 w-full rounded-xl" />
    </div>
  );
}

export function ProviderRecommendations({ estimate, isLoading, resultVersion, plans, workload }: Props) {
  const minimumMatches = matchProviderPlans(estimate.minimum, plans, criteriaForConfiguration(workload, estimate.minimum));
  const recommendedMatches = matchProviderPlans(estimate.recommended, plans, criteriaForConfiguration(workload, estimate.recommended));
  const usingMinimumFallback = recommendedMatches.length === 0 && minimumMatches.length > 0;
  const matches = usingMinimumFallback ? minimumMatches : recommendedMatches;
  const target = usingMinimumFallback ? estimate.minimum : estimate.recommended;
  const verifiedAt = plans.map((plan) => plan.lastUpdated).sort().at(-1);
  useEffect(() => {
    if (!isLoading) trackEvent("recommendation_impression", { resultCount: matches.length, region: workload.region, budget: workload.budget });
  }, [isLoading, matches.length, resultVersion, workload.budget, workload.region]);

  return (
    <section aria-labelledby="provider-recommendations-title" aria-busy={isLoading}>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="azure">Matching plans</Badge>
          <h2 id="provider-recommendations-title" className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            VPS plans that fit your baseline
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            {usingMinimumFallback ? "No recommended-tier plan fits, so these plans meet the minimum configuration." : "Plans meet the recommended resources, network, region, protection and budget requirements."}
          </p>
          <p className="mt-2 text-xs text-slate-500">{minimumMatches.length} minimum-tier matches · {recommendedMatches.length} recommended-tier matches</p>
        </div>
        <p className="text-xs text-slate-500">Catalog updated {verifiedAt || "—"}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-3" role="status">
          <PlanSkeleton />
          <PlanSkeleton />
          <PlanSkeleton />
          <span className="sr-only">Matching provider plans…</span>
        </div>
      ) : matches.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-3">
          {matches.map(({ kind, label, reason, plan }) => (
            <Card key={`${resultVersion}-${kind}-${plan.slug}`} className="result-in flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant={badgeVariant[kind]}>{label}</Badge>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{plan.providerName}</p>
                  <h3 className="mt-1 text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-sm font-extrabold text-[var(--color-brand-light)]">
                  {plan.providerName.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                </span>
              </div>

              <p className="mt-3 min-h-10 text-xs leading-relaxed text-slate-400">{reason}</p>

              <div className="mt-5 flex items-end gap-1 border-y border-[var(--color-border)] py-4">
                <span className="text-3xl font-extrabold text-white">${plan.priceMonthly * target.nodes}</span>
                <span className="pb-1 text-xs text-slate-400">USD/mo · {target.nodes} node{target.nodes > 1 ? "s" : ""}</span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-slate-500">Compute</dt><dd className="mt-0.5 font-semibold text-white">{plan.cpu} vCPU</dd></div>
                <div><dt className="text-xs text-slate-500">Memory</dt><dd className="mt-0.5 font-semibold text-white">{plan.ram} GB</dd></div>
                <div><dt className="text-xs text-slate-500">Storage</dt><dd className="mt-0.5 font-semibold text-white">{plan.storage} GB {plan.storageType}</dd></div>
                <div><dt className="text-xs text-slate-500">Transfer</dt><dd className="mt-0.5 font-semibold text-white">{plan.transferTb === null ? "Unmetered" : `${plan.transferTb} TB`}</dd></div>
              </dl>

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                {plan.locations.map((location) => location.country).filter((value, index, values) => values.indexOf(value) === index).join(" / ")} · {plan.note}
              </p>
              <p className="mt-2 text-xs text-slate-500">First month: ${(plan.priceMonthly + plan.setupFee) * target.nodes} · SLA {plan.slaPercent ?? "not published"}%</p>

              <div className="mt-auto pt-5">
                <a
                  href={plan.providerAffiliateLinkId
                    ? `/go/${plan.providerAffiliateLinkId}?source=vps-selector&plan=${encodeURIComponent(plan.slug)}&placement=${kind}`
                    : `/vps-plans/${plan.slug}`}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
                >
                  View {plan.name} →
                </a>
                <Link href={`/vps-plans/${plan.slug}`} className="mt-3 block text-center text-[11px] text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-white">
                  Plan details
                </Link>
                <Link href={`/compare?plans=${plan.slug}`} className="mt-3 block text-center text-[11px] text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-white">
                  Compare this plan
                </Link>
                <a href={plan.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-[11px] text-slate-500 underline decoration-slate-700 underline-offset-4 hover:text-slate-300">
                  Verify pricing source
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <h3 className="font-bold text-white">No catalog plan fits this workload yet</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            No available plan meets every resource, transfer, region and ${workload.budget} monthly budget constraint. Try a higher budget or a broader region.
          </p>
        </Card>
      )}

      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        Prices can change and may exclude tax or optional services. Some outbound links may be affiliate links; Neroviax may earn a commission at no extra cost to you. Ranking is based on resources and listed price, not commission. Read the{" "}
        <Link href="/affiliate-disclosure" className="rounded-sm text-slate-300 underline underline-offset-4 hover:text-white">affiliate disclosure</Link>.
      </p>
    </section>
  );
}
