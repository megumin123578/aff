import { notFound } from "next/navigation";
import { ProviderForm } from "@/components/admin/provider-form";
import { getProvider } from "@/lib/catalog";
import { getAffiliateLinks } from "@/lib/content";

export default async function EditProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [provider, affiliateLinks] = await Promise.all([getProvider(slug, true), getAffiliateLinks()]);
  if (!provider) notFound();
  return <div className="mx-auto max-w-4xl"><h1 className="mb-8 text-3xl font-extrabold text-white">Edit {provider.name}</h1><ProviderForm provider={provider} affiliateLinks={affiliateLinks} /></div>;
}
