import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { getProviders, getVpsPlans } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "VPS Provider Directory | Neroviax",
  description: "Browse VPS providers, locations, use cases, strengths and available cloud plans.",
  alternates: { canonical: "/providers" },
};
export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const [providers, plans] = await Promise.all([getProviders(), getVpsPlans()]);
  return <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8">
    <div className="w-full"><Badge variant="azure">Provider directory</Badge><h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white">VPS providers, documented clearly</h1><p className="mt-3 max-w-2xl text-slate-400">Compare locations, practical strengths and every currently available plan in the Neroviax catalog.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">{providers.map((provider) => {
        const providerPlans = plans.filter((plan) => plan.providerSlug === provider.slug);
        const lowestPrice = providerPlans.length ? Math.min(...providerPlans.map((plan) => plan.priceMonthly)) : null;
        return <Link key={provider.slug} href={`/providers/${provider.slug}`}><Card className="h-full p-6 transition hover:border-[var(--color-border-strong)]"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-wider text-[var(--color-brand-light)]">{provider.headquarters}</p><h2 className="mt-3 text-2xl font-bold text-white">{provider.name}</h2></div><Badge variant="mint">{providerPlans.length} plans</Badge></div><p className="mt-4 text-sm leading-relaxed text-slate-400">{provider.description}</p><div className="mt-6 flex flex-wrap gap-2">{provider.locations.map((location) => location.region).filter((value, index, values) => values.indexOf(value) === index).map((region) => <span key={region} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-slate-400">{region}</span>)}</div><p className="mt-6 text-sm font-semibold text-white">{lowestPrice === null ? "No available plans" : `From $${lowestPrice}/month`} →</p></Card></Link>;
      })}</div>
    </div>
  </main>;
}
