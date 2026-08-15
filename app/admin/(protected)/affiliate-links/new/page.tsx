import { AffiliateForm } from "@/components/admin/affiliate-form";
import { Card } from "@/components/ui";

export default function NewAffiliateLinkPage() {
  return <div><h1 className="text-3xl font-extrabold text-white">New affiliate link</h1><p className="mt-2 text-sm text-slate-400">Create a reusable redirect ID.</p><Card className="mt-8 p-6"><AffiliateForm /></Card></div>;
}
