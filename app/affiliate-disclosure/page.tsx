import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | Neroviax",
  description: "How Neroviax uses affiliate links while keeping infrastructure recommendations independent.",
};

export default async function AffiliateDisclosurePage({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const { link } = await searchParams;
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8">
      <Card className="mx-auto max-w-3xl p-[clamp(24px,5vw,48px)]">
        <Badge variant="azure">Transparency</Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Affiliate disclosure</h1>
        {link && <p className="mt-5 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-4 text-sm text-[var(--color-warning-text)]">That outbound link is currently unavailable. No redirect was performed.</p>}
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-300">
          <p>Neroviax may earn a commission when you purchase a service through certain outbound links. This does not increase the price you pay.</p>
          <p>Provider ranking in the VPS calculator is based on whether a plan satisfies the estimated CPU, RAM and storage requirements, followed by its listed price and available headroom. Commission rates are not part of the ranking formula.</p>
          <p>Prices and plan specifications can change. We show the date each catalog entry was last checked and link to the provider&apos;s official pricing source so you can verify the current offer before purchasing.</p>
          <p>Neroviax does not accept payment to alter calculator results. Infrastructure estimates remain informational and should be validated with production monitoring.</p>
        </div>
        <Link href="/tools/vps-selector" className="mt-8 inline-flex rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-hover)]">
          Return to VPS Calculator →
        </Link>
      </Card>
    </main>
  );
}
