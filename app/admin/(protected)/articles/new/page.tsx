import { ArticleForm } from "@/components/admin/article-form";
import { getAffiliateLinks } from "@/lib/content";

export default async function NewArticlePage() {
  const links = await getAffiliateLinks();
  return <div><h1 className="text-3xl font-extrabold text-white">New post</h1><p className="mt-2 text-sm text-slate-400">Create a draft or publish directly.</p><div className="mt-8"><ArticleForm affiliateLinks={links} /></div></div>;
}
