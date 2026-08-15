import { notFound } from "next/navigation";
import { AffiliateForm } from "@/components/admin/affiliate-form";
import { Card } from "@/components/ui";
import { getAffiliateLink } from "@/lib/content";

export default async function EditAffiliateLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await getAffiliateLink(id);
  if (!link) notFound();
  return <div><h1 className="text-3xl font-extrabold text-white">Edit affiliate link</h1><p className="mt-2 text-sm text-slate-400">Shortcode ID: {link.id}</p><Card className="mt-8 p-6"><AffiliateForm link={link} /></Card></div>;
}
