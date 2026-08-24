import type { Metadata } from "next";
import { VpsSelector } from "@/components/vps-selector";
import { Badge } from "@/components/ui";
import { getVpsPlans } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "VPS Selector",
  description: "Estimate a sensible VPS configuration from your real-world workload.",
  alternates: { canonical: "/tools/vps-selector" },
};

export const dynamic = "force-dynamic";

export default async function VpsSelectorPage() {
  const plans = await getVpsPlans();
  return (
    <main className="relative min-h-screen bg-[var(--color-bg-deep)] py-14 lg:py-20">
      <div className="w-full px-5 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge>Sizing Tool</Badge>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            How much VPS do you actually need?
          </h1>
        </div>

        <VpsSelector plans={plans} />
      </div>
    </main>
  );
}
