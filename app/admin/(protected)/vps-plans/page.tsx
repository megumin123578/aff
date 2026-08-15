import Link from "next/link";
import { Badge, Card, LinkButton } from "@/components/ui";
import { getVpsPlans } from "@/lib/catalog";

export default async function AdminPlansPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [plans, query] = await Promise.all([getVpsPlans({ includeUnavailable: true }), searchParams]);
  return <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-extrabold text-white">VPS plans</h1><p className="mt-2 text-sm text-slate-400">Manage plan specifications, availability and price records.</p></div><LinkButton href="/admin/vps-plans/new" variant="azure">New VPS plan</LinkButton></div>
    {query.saved && <p className="mt-5 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] p-4 text-sm text-[var(--color-success-text)]">VPS plan saved.</p>}
    <div className="mt-8 space-y-4">{plans.map((plan) => <Card key={plan.slug} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Badge variant={plan.available ? "mint" : "default"}>{plan.available ? "available" : "unavailable"}</Badge><span className="font-mono text-xs text-slate-500">{plan.slug}</span></div><h2 className="mt-3 font-bold text-white">{plan.providerName} · {plan.name}</h2><p className="mt-1 text-xs text-slate-500">{plan.cpu} vCPU · {plan.ram} GB · {plan.storage} GB {plan.storageType} · ${plan.priceMonthly}/mo</p></div><Link href={`/admin/vps-plans/${plan.slug}/edit`} className="rounded-lg bg-[var(--color-brand)] px-3 py-2 text-center text-xs font-bold text-white">Edit</Link></Card>)}</div>
  </div>;
}
