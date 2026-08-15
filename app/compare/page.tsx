import type { Metadata } from "next";
import { Badge } from "@/components/ui";
import { VpsComparison } from "@/components/vps-comparison";
import { getVpsPlans } from "@/lib/catalog";

export const metadata: Metadata = { title: "Compare VPS Plans | Neroviax", description: "Compare VPS pricing, CPU, RAM, storage, bandwidth, regions, network, backup and value side by side.", alternates: { canonical: "/compare" } };
export const dynamic = "force-dynamic";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ plans?: string }> }) {
  const [plans, query] = await Promise.all([getVpsPlans(), searchParams]);
  const requested = (query.plans || "").split(",").filter(Boolean);
  const valid = requested.filter((slug, index) => requested.indexOf(slug) === index && plans.some((plan) => plan.slug === slug)).slice(0, 4);
  const initialSlugs = valid.length ? valid : plans.slice(0, 2).map((plan) => plan.slug);
  return <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8"><div className="w-full"><Badge variant="azure">VPS comparison</Badge><h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">Compare plans side by side</h1><p className="mt-4 max-w-3xl text-slate-400">Review normalized price, compute, storage, transfer, regions, network features and relative value. Your selection stays in the shareable URL.</p><div className="mt-10"><VpsComparison plans={plans} initialSlugs={initialSlugs} /></div></div></main>;
}
