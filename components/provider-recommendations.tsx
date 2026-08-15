"use client";

import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import {
  matchProviderPlans,
  PROVIDER_AFFILIATE_IDS,
  type MatchKind,
} from "@/lib/providers";
import type { ServerEstimate } from "@/lib/selector";

type Props = {
  estimate: ServerEstimate;
  isLoading: boolean;
  resultVersion: number;
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

export function ProviderRecommendations({ estimate, isLoading, resultVersion }: Props) {
  const matches = matchProviderPlans(estimate);

  return (
    <section aria-labelledby="provider-recommendations-title" aria-busy={isLoading}>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="azure">Matching plans</Badge>
          <h2 id="provider-recommendations-title" className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            VPS plans that fit your baseline
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Every displayed plan meets or exceeds the calculated CPU, RAM and storage requirements.
          </p>
        </div>
        <p className="text-xs text-slate-500">Catalog verified 14 Aug 2026</p>
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
            <Card key={`${resultVersion}-${kind}-${plan.id}`} className="result-in flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant={badgeVariant[kind]}>{label}</Badge>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{plan.providerName}</p>
                  <h3 className="mt-1 text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-sm font-extrabold text-[var(--color-brand-light)]">
                  {plan.provider === "hetzner" ? "HZ" : "DO"}
                </span>
              </div>

              <p className="mt-3 min-h-10 text-xs leading-relaxed text-slate-400">{reason}</p>

              <div className="mt-5 flex items-end gap-1 border-y border-[var(--color-border)] py-4">
                <span className="text-3xl font-extrabold text-white">${plan.priceMonthly}</span>
                <span className="pb-1 text-xs text-slate-400">USD / month</span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-slate-500">Compute</dt><dd className="mt-0.5 font-semibold text-white">{plan.cpu} vCPU</dd></div>
                <div><dt className="text-xs text-slate-500">Memory</dt><dd className="mt-0.5 font-semibold text-white">{plan.ram} GB</dd></div>
                <div><dt className="text-xs text-slate-500">Storage</dt><dd className="mt-0.5 font-semibold text-white">{plan.storage} GB</dd></div>
                <div><dt className="text-xs text-slate-500">Transfer</dt><dd className="mt-0.5 font-semibold text-white">{plan.transfer}</dd></div>
              </dl>

              <p className="mt-4 text-xs leading-relaxed text-slate-500">{plan.locations} · {plan.note}</p>

              <div className="mt-auto pt-5">
                <a
                  href={`/go/${PROVIDER_AFFILIATE_IDS[plan.provider]}?source=vps-selector&plan=${encodeURIComponent(plan.id)}&placement=${kind}`}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
                >
                  View {plan.name} →
                </a>
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
            The estimate exceeds the plans currently verified by Neroviax. Consider a dedicated server or split the workload across multiple nodes.
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
