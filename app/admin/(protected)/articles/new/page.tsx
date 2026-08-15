import { ArticleForm } from "@/components/admin/article-form";
import { Card } from "@/components/ui";
import { getAffiliateLinks } from "@/lib/content";

export default async function NewArticlePage() {
  const links = await getAffiliateLinks();
  return <div><h1 className="text-3xl font-extrabold text-white">New article</h1><p className="mt-2 text-sm text-slate-400">Create a draft or publish directly.</p><Card className="mt-8 p-6"><ArticleForm affiliateLinks={links} /></Card></div>;
}
