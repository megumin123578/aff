import Link from "next/link";
import { Badge, Card, LinkButton } from "@/components/ui";
import { getProviders } from "@/lib/catalog";

export default async function AdminProvidersPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [providers, query] = await Promise.all([getProviders(true), searchParams]);
  return <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-extrabold text-white">Providers</h1><p className="mt-2 text-sm text-slate-400">Manage provider profiles, locations and affiliate registry mapping.</p></div><LinkButton href="/admin/providers/new" variant="azure">New provider</LinkButton></div>
    {query.saved && <p className="mt-5 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] p-4 text-sm text-[var(--color-success-text)]">Provider saved.</p>}
    <div className="mt-8 space-y-4">{providers.map((provider) => <Card key={provider.slug} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Badge variant={provider.active ? "mint" : "default"}>{provider.active ? "active" : "inactive"}</Badge><span className="font-mono text-xs text-slate-500">{provider.slug}</span></div><h2 className="mt-3 font-bold text-white">{provider.name}</h2><p className="mt-1 text-xs text-slate-500">{provider.locations.length} locations · {provider.affiliateLinkId || "no affiliate mapping"}</p></div><Link href={`/admin/providers/${provider.slug}/edit`} className="rounded-lg bg-[var(--color-brand)] px-3 py-2 text-center text-xs font-bold text-white">Edit</Link></Card>)}</div>
  </div>;
}
