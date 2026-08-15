import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { PlanDiscoveryResults } from "@/components/plan-discovery-results";
import { getProviders, getVpsPlans } from "@/lib/catalog";
import { filterAndSortPlans, hasActivePlanFilters, parsePlanFilters } from "@/lib/plan-discovery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams;
  const filtered = Object.values(query).some((value) => typeof value === "string" && value.length > 0);
  return {
    title: "VPS Plan Database | Neroviax",
    description: "Filter available VPS plans by price, CPU, RAM, storage, bandwidth, region and architecture.",
    alternates: { canonical: "/vps-plans" },
    robots: { index: !filtered, follow: true },
  };
}

function searchParamsFromRecord(record: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) if (typeof value === "string") params.set(key, value);
  return params;
}

const fieldClass = "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-brand-border)]";
const labelClass = "block text-[11px] font-semibold uppercase tracking-wider text-slate-400";

export default async function VpsPlansPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [allPlans, providers, query] = await Promise.all([getVpsPlans(), getProviders(), searchParams]);
  const rawParams = searchParamsFromRecord(query);
  const filters = parsePlanFilters(rawParams);
  const plans = filterAndSortPlans(allPlans, filters);
  const regions = [...new Set(allPlans.flatMap((plan) => plan.locations.map((location) => location.region)))].sort();
  const filtered = hasActivePlanFilters(filters);
  return <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 pb-28 lg:px-8"><div className="w-full"><Badge variant="azure">Plan database</Badge><h1 className="mt-4 text-4xl font-extrabold text-white">Find the right VPS plan</h1><p className="mt-3 max-w-2xl text-slate-400">Filter normalized catalog data and send selected plans directly into comparison.</p>
    <Card className="mt-8 p-5"><form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"><label className={`${labelClass} sm:col-span-2`}>Search plans<input name="q" defaultValue={filters.query} placeholder="Provider or plan name" className={fieldClass} /></label><label className={labelClass}>Provider<select name="provider" defaultValue={filters.provider} className={fieldClass}><option value="">All providers</option>{providers.map((provider) => <option key={provider.slug} value={provider.slug}>{provider.name}</option>)}</select></label><label className={labelClass}>Region<select name="region" defaultValue={filters.region} className={fieldClass}><option value="">All regions</option>{regions.map((region) => <option key={region}>{region}</option>)}</select></label><label className={labelClass}>Max price<input type="number" min="0" step="1" name="price" defaultValue={filters.maxPrice ?? ""} placeholder="USD/month" className={fieldClass} /></label><label className={labelClass}>Minimum CPU<input type="number" min="0" name="cpu" defaultValue={filters.minCpu ?? ""} className={fieldClass} /></label><label className={labelClass}>Minimum RAM<input type="number" min="0" name="ram" defaultValue={filters.minRam ?? ""} className={fieldClass} /></label><label className={labelClass}>Minimum storage<input type="number" min="0" name="storage" defaultValue={filters.minStorage ?? ""} className={fieldClass} /></label><label className={labelClass}>Minimum transfer<input type="number" min="0" step="0.1" name="transfer" defaultValue={filters.minTransfer ?? ""} className={fieldClass} /></label><label className={labelClass}>Storage type<select name="storageType" defaultValue={filters.storageType} className={fieldClass}><option value="">Any</option><option>SSD</option><option>NVMe</option></select></label><label className={labelClass}>Architecture<select name="architecture" defaultValue={filters.architecture} className={fieldClass}><option value="">Any</option><option value="x86_64">x86_64</option><option value="arm64">arm64</option></select></label><label className={labelClass}>Sort by<select name="sort" defaultValue={filters.sort} className={fieldClass}><option value="price">Lowest price</option><option value="value">Best value</option><option value="ram">Most RAM</option><option value="cpu">Most CPU</option><option value="updated">Recently updated</option></select></label><div className="flex flex-wrap items-end gap-3 lg:col-span-2">{[["ipv4", "IPv4", filters.ipv4], ["ipv6", "IPv6", filters.ipv6], ["backup", "Backup", filters.backup]].map(([name, label, checked]) => <label key={String(name)} className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-xs text-slate-300"><input type="checkbox" name={String(name)} value="1" defaultChecked={Boolean(checked)} className="accent-[var(--color-brand)]" />{String(label)}</label>)}</div><div className="flex items-end gap-2"><button className="rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-bold text-white">Apply filters</button>{filtered && <Link href="/vps-plans" className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm text-slate-300">Reset</Link>}</div></form></Card>
    <div className="mb-5 mt-8 flex items-center justify-between"><p className="text-sm text-slate-400"><strong className="text-white">{plans.length}</strong> of {allPlans.length} plans</p>{filtered && <Badge>Filtered results</Badge>}</div><PlanDiscoveryResults plans={plans} filterSignature={rawParams.toString()} filtered={filtered} />
  </div></main>;
}
