import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, LinkButton } from "@/components/ui";
import { getProvider, getProviders, getVpsPlans } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { absoluteUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProvider(slug);
  if (!provider) return {};
  return { title: `${provider.name} VPS Plans & Review`, description: provider.description, alternates: { canonical: `/providers/${provider.slug}` }, openGraph: { title: `${provider.name} VPS Plans & Review`, description: provider.description, url: `/providers/${provider.slug}` }, twitter: { card: "summary_large_image", title: `${provider.name} VPS Plans & Review`, description: provider.description } };
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [provider, plans, providers] = await Promise.all([getProvider(slug), getVpsPlans({ providerSlug: slug }), getProviders()]);
  if (!provider) notFound();
  const alternatives = providers.filter((item) => provider.alternatives.includes(item.slug));
  return <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-14 lg:px-8"><div className="mx-auto max-w-6xl">
    <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Providers", path: "/providers" }, { name: provider.name, path: `/providers/${provider.slug}` }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@context": "https://schema.org", "@type": "Organization", name: provider.name, url: provider.websiteUrl, description: provider.description, sameAs: [provider.websiteUrl], mainEntityOfPage: absoluteUrl(`/providers/${provider.slug}`) })} />
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]"><div><Badge variant="azure">Provider profile</Badge><h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">{provider.name}</h1><p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">{provider.description}</p><div className="mt-7 flex flex-wrap gap-3"><LinkButton href="#plans" variant="azure">View {plans.length} plans</LinkButton><a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold text-white">Official website ↗</a></div></div>
      <Card className="p-6"><h2 className="font-bold text-white">Provider facts</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-500">Headquarters</dt><dd className="text-white">{provider.headquarters || "—"}</dd></div><div><dt className="text-slate-500">Founded</dt><dd className="text-white">{provider.foundedYear || "—"}</dd></div><div><dt className="text-slate-500">Locations</dt><dd className="text-white">{provider.locations.length}</dd></div></dl></Card>
    </div>
    <div className="mt-12 grid gap-6 md:grid-cols-3"><Card className="p-6"><h2 className="font-bold text-white">Features</h2><ul className="mt-4 space-y-2 text-sm text-slate-400">{provider.features.map((item) => <li key={item}>• {item}</li>)}</ul></Card><Card className="p-6"><h2 className="font-bold text-[var(--color-success-text)]">Pros</h2><ul className="mt-4 space-y-2 text-sm text-slate-400">{provider.pros.map((item) => <li key={item}>+ {item}</li>)}</ul></Card><Card className="p-6"><h2 className="font-bold text-white">Cons</h2><ul className="mt-4 space-y-2 text-sm text-slate-400">{provider.cons.map((item) => <li key={item}>− {item}</li>)}</ul></Card></div>
    <section id="plans" className="mt-14"><div className="flex items-end justify-between"><div><Badge>Available catalog</Badge><h2 className="mt-3 text-3xl font-extrabold text-white">{provider.name} VPS plans</h2></div><Link href="/vps-plans" className="text-sm text-slate-400 hover:text-white">All plans →</Link></div><div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{plans.map((plan) => <Link key={plan.slug} href={`/vps-plans/${plan.slug}`}><Card className="h-full p-5 transition hover:border-[var(--color-border-strong)]"><div className="flex justify-between gap-3"><h3 className="font-bold text-white">{plan.name}</h3><span className="font-bold text-white">${plan.priceMonthly} {plan.currency}/mo</span></div><p className="mt-4 text-sm text-slate-400">{plan.cpu} vCPU · {plan.ram} GB RAM · {plan.storage} GB {plan.storageType}</p><p className="mt-4 text-xs text-[var(--color-brand-light)]">Plan details →</p></Card></Link>)}</div></section>
    {alternatives.length > 0 && <section className="mt-14"><h2 className="text-2xl font-extrabold text-white">Alternatives</h2><div className="mt-5 flex flex-wrap gap-3">{alternatives.map((item) => <LinkButton key={item.slug} href={`/providers/${item.slug}`}>{item.name}</LinkButton>)}</div></section>}
  </div></main>;
}
