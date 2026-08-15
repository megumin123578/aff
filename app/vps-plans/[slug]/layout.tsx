import { getVpsPlan } from "@/lib/catalog";
import { absoluteUrl, breadcrumbJsonLd, jsonLd } from "@/lib/seo";

export default async function PlanLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const plan = await getVpsPlan((await params).slug);
  if (!plan) return children;
  const path = `/vps-plans/${plan.slug}`;
  const product = {
    "@context": "https://schema.org", "@type": "Product", name: `${plan.providerName} ${plan.name}`,
    description: `${plan.cpu} vCPU, ${plan.ram} GB RAM and ${plan.storage} GB ${plan.storageType}`,
    brand: { "@type": "Brand", name: plan.providerName }, url: absoluteUrl(path),
    offers: { "@type": "Offer", url: plan.sourceUrl, priceCurrency: plan.currency, price: plan.priceMonthly, availability: "https://schema.org/InStock" },
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(product)} /><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "VPS Plans", path: "/vps-plans" }, { name: `${plan.providerName} ${plan.name}`, path }]))} />{children}</>;
}
