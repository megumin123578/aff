"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import type { CatalogPlan } from "@/lib/catalog-types";
import { trackEvent } from "@/lib/client-analytics";

function unique(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function rawValue(plan: CatalogPlan) {
  const transfer = plan.transferTb ?? 25;
  return (plan.cpu * 2 + plan.ram + plan.storage / 20 + transfer / 2) / Math.max(plan.priceMonthly, 1);
}

function planHighlights(plan: CatalogPlan, selected: CatalogPlan[]) {
  const prices = selected.map((item) => item.priceMonthly);
  const transfers = selected.map((item) => item.transferTb ?? Number.POSITIVE_INFINITY);
  const pros = [
    plan.priceMonthly === Math.min(...prices) ? "Lowest monthly price" : "",
    (plan.transferTb ?? Number.POSITIVE_INFINITY) === Math.max(...transfers) ? "Most included transfer" : "",
    plan.storageType === "NVMe" ? "NVMe storage" : "",
    plan.backupAvailable ? "Backup available" : "",
  ].filter(Boolean);
  const cons = [
    plan.priceMonthly === Math.max(...prices) && selected.length > 1 ? "Highest monthly price" : "",
    !plan.backupAvailable ? "No provider backup option" : "",
    plan.egressCostPerGb !== null && plan.egressCostPerGb > 0 ? "Extra egress can incur charges" : "",
    !plan.ipv4 ? "No IPv4" : "",
  ].filter(Boolean);
  return { pros: unique(pros), cons: unique(cons) };
}

export function VpsComparison({ plans, initialSlugs }: { plans: CatalogPlan[]; initialSlugs: string[] }) {
  const [selectedSlugs, setSelectedSlugs] = useState(initialSlugs);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const selected = useMemo(() => selectedSlugs.map((slug) => plans.find((plan) => plan.slug === slug)).filter((plan): plan is CatalogPlan => Boolean(plan)), [plans, selectedSlugs]);
  const bestRawValue = Math.max(...selected.map(rawValue), 1);
  useEffect(() => { trackEvent("comparison_started", { planCount: initialSlugs.length }); }, [initialSlugs.length]);

  const syncSelection = (slugs: string[]) => {
    setSelectedSlugs(slugs);
    setCopyState("idle");
    const params = new URLSearchParams(window.location.search);
    if (slugs.length) params.set("plans", slugs.join(",")); else params.delete("plans");
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    trackEvent("comparison_updated", { planCount: slugs.length });
  };

  const toggle = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      if (selectedSlugs.length > 1) syncSelection(selectedSlugs.filter((item) => item !== slug));
      return;
    }
    if (selectedSlugs.length < 4) syncSelection([...selectedSlugs, slug]);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
      trackEvent("comparison_link_copied", { planCount: selectedSlugs.length });
    } catch {
      setCopyState("error");
    }
  };

  const rows: Array<[string, (plan: CatalogPlan) => string]> = [
    ["Monthly price", (plan) => `$${plan.priceMonthly} ${plan.currency}`],
    ["vCPU", (plan) => String(plan.cpu)],
    ["RAM", (plan) => `${plan.ram} GB`],
    ["Storage", (plan) => `${plan.storage} GB ${plan.storageType}`],
    ["Transfer", (plan) => plan.transferTb === null ? "Unmetered" : `${plan.transferTb} TB`],
    ["Network", (plan) => plan.networkSpeedMbps ? `${plan.networkSpeedMbps} Mbps` : "Not published"],
    ["Regions", (plan) => unique(plan.locations.map((location) => location.region)).join(", ") || "Not published"],
    ["IP support", (plan) => [plan.ipv4 ? "IPv4" : "", plan.ipv6 ? "IPv6" : ""].filter(Boolean).join(" + ") || "None"],
    ["Backup", (plan) => plan.backupAvailable ? "Available" : "No"],
    ["Snapshots", (plan) => plan.snapshotAvailable ? "Available" : "No"],
    ["SLA", (plan) => plan.slaPercent === null ? "Not published" : `${plan.slaPercent}%`],
    ["Setup fee", (plan) => `$${plan.setupFee}`],
    ["Extra egress", (plan) => plan.egressCostPerGb === null ? "Not published" : `$${plan.egressCostPerGb}/GB`],
  ];

  return <div className="space-y-10">
    <Card className="p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-bold text-white">Choose up to 4 plans</h2><p className="mt-1 text-sm text-slate-400">{selectedSlugs.length}/4 selected. Keep at least one plan selected.</p></div><Button onClick={copyLink} variant="azure">{copyState === "copied" ? "Link copied ✓" : copyState === "error" ? "Copy failed" : "Copy comparison link"}</Button></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{plans.map((plan) => { const checked = selectedSlugs.includes(plan.slug); return <label key={plan.slug} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${checked ? "border-[var(--color-brand-border)] bg-[var(--color-brand-soft)]" : "border-[var(--color-border)] bg-[var(--color-bg)]"}`}><input type="checkbox" checked={checked} disabled={!checked && selectedSlugs.length >= 4} onChange={() => toggle(plan.slug)} className="mt-1 accent-[var(--color-brand)]" /><span><strong className="block text-sm text-white">{plan.providerName} · {plan.name}</strong><span className="mt-1 block text-xs text-slate-400">{plan.cpu} vCPU · {plan.ram} GB · ${plan.priceMonthly} {plan.currency}/mo</span></span></label>; })}</div>
    </Card>

    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]"><table className="w-full min-w-[760px] border-collapse bg-[var(--color-surface)] text-left"><thead><tr><th className="sticky left-0 z-10 w-44 border-b border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs uppercase tracking-wider text-slate-500">Specification</th>{selected.map((plan) => <th key={plan.slug} className="min-w-52 border-b border-[var(--color-border)] p-4 align-top"><Badge variant="azure">{plan.providerName}</Badge><Link href={`/vps-plans/${plan.slug}`} className="mt-3 block text-lg font-bold text-white hover:text-[var(--color-brand-light)]">{plan.name}</Link><p className="mt-2 text-2xl font-extrabold text-white">${plan.priceMonthly}<span className="text-xs font-normal text-slate-500"> {plan.currency}/mo</span></p></th>)}</tr></thead><tbody>
      <tr><th className="sticky left-0 border-b border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-slate-400">Value score</th>{selected.map((plan) => { const score = Math.round(rawValue(plan) / bestRawValue * 100); return <td key={plan.slug} className="border-b border-[var(--color-border)] p-4"><strong className="text-xl text-[var(--color-success-text)]">{score}/100</strong><div className="mt-2 h-1.5 rounded-full bg-[var(--color-bg)]"><div className="h-full rounded-full bg-[var(--color-success)]" style={{ width: `${score}%` }} /></div></td>; })}</tr>
      {rows.map(([label, value]) => <tr key={label}><th className="sticky left-0 border-b border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm font-medium text-slate-400">{label}</th>{selected.map((plan) => <td key={plan.slug} className="border-b border-[var(--color-border)] p-4 text-sm font-semibold text-white">{value(plan)}</td>)}</tr>)}
      <tr><th className="sticky left-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-slate-400">Pros / Cons</th>{selected.map((plan) => { const highlights = planHighlights(plan, selected); return <td key={plan.slug} className="p-4 align-top text-xs"><ul className="space-y-2 text-[var(--color-success-text)]">{highlights.pros.map((item) => <li key={item}>+ {item}</li>)}</ul><ul className="mt-3 space-y-2 text-slate-400">{highlights.cons.map((item) => <li key={item}>− {item}</li>)}</ul></td>; })}</tr>
    </tbody></table></div>
    <p className="text-xs leading-relaxed text-slate-500">Value score compares listed resources and transfer against monthly price within the selected set. It does not include independent benchmark data yet.</p>
  </div>;
}
