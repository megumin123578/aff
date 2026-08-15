import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { getVpsPlans } from "@/lib/catalog";
import { getSavedRecommendation } from "@/lib/recommendations";
import { workloadToSearchParams, type ServerConfiguration } from "@/lib/selector";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; const result = await getSavedRecommendation(id); if (!result) return {};
  return { title: `Saved VPS Recommendation ${id} | Neroviax`, description: `${result.recommended.cpu} vCPU, ${result.recommended.ram} GB RAM and ${result.recommended.storage} GB ${result.recommended.storageType}.`, alternates: { canonical: `/recommendations/${id}` }, robots: { index: false, follow: true } };
}

function Configuration({ label, configuration, preferred = false }: { label: string; configuration: ServerConfiguration; preferred?: boolean }) {
  const values = [["vCPU", configuration.cpu], ["RAM", `${configuration.ram} GB`], ["Storage", `${configuration.storage} GB ${configuration.storageType}`], ["Transfer", `${configuration.bandwidth} TB`], ["Network", `${configuration.networkSpeedMbps} Mbps`], ["Nodes", configuration.nodes], ["Architecture", configuration.architecture], ["Backup", configuration.backupRequired ? "Required" : "Optional"], ["IPv4", configuration.ipv4Required ? "Required" : "Optional"], ["Minimum SLA", `${configuration.minimumSla}%`]];
  return <Card className="p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white">{label}</h2>{preferred && <Badge variant="mint">Preferred</Badge>}</div><dl className="mt-5 grid grid-cols-2 gap-4">{values.map(([name, value]) => <div key={String(name)}><dt className="text-xs text-slate-500">{name}</dt><dd className="mt-1 font-bold text-white">{value}</dd></div>)}</dl></Card>;
}

export default async function SavedRecommendationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const result = await getSavedRecommendation(id); if (!result) notFound();
  const plans = (await getVpsPlans()).filter((plan) => result.matchedPlanSlugs.includes(plan.slug));
  return <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-14 lg:px-8"><div className="mx-auto max-w-5xl"><Badge variant="azure">Saved recommendation</Badge><h1 className="mt-4 text-4xl font-extrabold text-white">VPS recommendation snapshot</h1><p className="mt-3 text-sm text-slate-400">Formula v{result.formulaVersion} · saved {new Date(result.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · ID {result.shareId}</p><div className="mt-8 grid gap-6 md:grid-cols-2"><Configuration label="Minimum" configuration={result.minimum} /><Configuration label="Recommended" configuration={result.recommended} preferred /></div>
    <Card className="mt-8 p-6"><h2 className="text-xl font-bold text-white">Workload snapshot</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs text-slate-500">Application</dt><dd className="text-white">{result.workload.application} / {result.workload.runtime}</dd></div><div><dt className="text-xs text-slate-500">Traffic</dt><dd className="text-white">{result.workload.requestsPerMinute} req/min</dd></div><div><dt className="text-xs text-slate-500">Database</dt><dd className="text-white">{result.workload.databaseType} · {result.workload.databaseSize} GB</dd></div><div><dt className="text-xs text-slate-500">Region / budget</dt><dd className="text-white">{result.workload.region} · ${result.workload.budget}/mo</dd></div></dl><Link href={`/tools/vps-selector?${workloadToSearchParams(result.workload).toString()}`} className="mt-6 inline-block text-sm text-[var(--color-brand-light)]">Reopen this workload in Selector →</Link></Card>
    <section className="mt-10"><h2 className="text-2xl font-extrabold text-white">Matched plans at save time</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{plans.map((plan) => <Link key={plan.slug} href={`/vps-plans/${plan.slug}`}><Card className="h-full p-5"><p className="text-xs text-slate-500">{plan.providerName}</p><h3 className="mt-2 font-bold text-white">{plan.name}</h3><p className="mt-3 text-sm text-slate-400">{plan.cpu} vCPU · {plan.ram} GB · ${plan.priceMonthly} {plan.currency}/mo</p></Card></Link>)}{plans.length === 0 && <p className="text-sm text-slate-400">No saved match is currently available in the live catalog.</p>}</div></section>
  </div></main>;
}
