"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { TrackedLink } from "@/components/tracked-link";
import { trackEvent } from "@/lib/client-analytics";
import type { CatalogPlan } from "@/lib/catalog-types";

const storageKey = "neroviax_compare_plans";

export function PlanDiscoveryResults({ plans, filterSignature, filtered }: { plans: CatalogPlan[]; filterSignature: string; filtered: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    let hydrationTimer: number | undefined;
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved)) hydrationTimer = window.setTimeout(() => setSelected(saved.filter((slug): slug is string => typeof slug === "string").slice(0, 4)), 0);
    } catch { /* Ignore invalid browser state. */ }
    if (filtered) trackEvent("filter_used", { filters: filterSignature, resultCount: plans.length });
    return () => { if (hydrationTimer !== undefined) window.clearTimeout(hydrationTimer); };
  }, [filterSignature, filtered, plans.length]);

  const toggle = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((item) => item !== slug) : selected.length < 4 ? [...selected, slug] : selected;
    setSelected(next);
    try { window.sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Storage is optional. */ }
  };

  return <>
    {plans.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <Card key={plan.slug} className="flex h-full flex-col p-6"><div className="flex items-start justify-between gap-3"><div><TrackedLink href={`/providers/${plan.providerSlug}`} eventName="provider_clicked" eventProperties={{ provider: plan.providerSlug, source: "plan-list" }} className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-white">{plan.providerName}</TrackedLink><TrackedLink href={`/vps-plans/${plan.slug}`} eventName="plan_clicked" eventProperties={{ plan: plan.slug, provider: plan.providerSlug, source: "plan-list" }} className="mt-2 block text-xl font-bold text-white hover:text-[var(--color-brand-light)]">{plan.name}</TrackedLink></div><Badge variant="mint">Available</Badge></div><div className="mt-5 flex items-end gap-1"><span className="text-3xl font-extrabold text-white">${plan.priceMonthly}</span><span className="pb-1 text-xs text-slate-500">{plan.currency}/mo</span></div><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-500">Compute</dt><dd className="text-white">{plan.cpu} vCPU</dd></div><div><dt className="text-xs text-slate-500">Memory</dt><dd className="text-white">{plan.ram} GB</dd></div><div><dt className="text-xs text-slate-500">Storage</dt><dd className="text-white">{plan.storage} GB {plan.storageType}</dd></div><div><dt className="text-xs text-slate-500">Transfer</dt><dd className="text-white">{plan.transferTb ?? "∞"} TB</dd></div></dl><div className="mt-auto flex items-center justify-between gap-3 pt-6"><p className="text-xs text-slate-500">Updated {plan.lastUpdated}</p><label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-300"><input type="checkbox" checked={selected.includes(plan.slug)} disabled={!selected.includes(plan.slug) && selected.length >= 4} onChange={() => toggle(plan.slug)} className="accent-[var(--color-brand)]" /> Compare</label></div></Card>)}</div> : <Card className="p-10 text-center"><h2 className="text-xl font-bold text-white">No plans match these filters</h2><p className="mt-2 text-sm text-slate-400">Remove one or more constraints and try again.</p><Link href="/vps-plans" className="mt-5 inline-block text-sm text-[var(--color-brand-light)]">Clear all filters →</Link></Card>}
    {selected.length > 0 && <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-header)] p-4 shadow-2xl backdrop-blur-xl"><div><p className="text-sm font-bold text-white">{selected.length}/4 plans selected</p><button type="button" onClick={() => { setSelected([]); try { window.sessionStorage.removeItem(storageKey); } catch {} }} className="mt-1 text-xs text-slate-400 underline">Clear selection</button></div><Link href={`/compare?plans=${selected.join(",")}`} className="rounded-xl bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white">Compare selected →</Link></div>}
  </>;
}
