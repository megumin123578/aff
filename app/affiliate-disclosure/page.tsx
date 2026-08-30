import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How Neroviax uses affiliate links while keeping tech reviews and recommendations independent.",
  alternates: { canonical: "/affiliate-disclosure" },
};

export default async function AffiliateDisclosurePage({
  searchParams,
}: {
  searchParams: Promise<{ link?: string }>;
}) {
  const { link } = await searchParams;
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8">
      <Card className="mx-auto max-w-3xl p-[clamp(24px,5vw,48px)]">
        <Badge variant="azure">Transparency</Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Affiliate disclosure
        </h1>
        {link && (
          <p className="mt-5 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-4 text-sm text-[var(--color-warning-text)]">
            That outbound product link is currently unavailable. No redirect was performed.
          </p>
        )}
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-300">
          <p>
            Neroviax may earn a commission when you purchase hardware or services through our outbound affiliate links (including Shopee, Lazada, Amazon, and official brand stores). This does not increase the price you pay.
          </p>
          <p>
            Our reviews and rankings are based purely on build quality, ergonomic value, reliability, and price-to-performance ratio. Commission rates or sponsorship deals do not influence our editorial scoring or trade-off analysis.
          </p>
          <p>
            Prices, discounts, and inventory availability change frequently on e-commerce platforms. We link to official product pages so you can verify the latest pricing and seller reputation before purchasing.
          </p>
          <p>
            If you have questions about any product we review, feel free to ask directly in the comments section under each article.
          </p>
        </div>
        <Link
          href="/forums"
          className="mt-8 inline-flex rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-hover)]"
        >
          Explore Our Posts →
        </Link>
      </Card>
    </main>
  );
}
