import { ProviderForm } from "@/components/admin/provider-form";
import { getAffiliateLinks } from "@/lib/content";

export default async function NewProviderPage() {
  const affiliateLinks = await getAffiliateLinks();
  return <div className="mx-auto max-w-4xl"><h1 className="mb-8 text-3xl font-extrabold text-white">New provider</h1><ProviderForm affiliateLinks={affiliateLinks} /></div>;
}
