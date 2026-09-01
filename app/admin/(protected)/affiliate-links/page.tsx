import Link from "next/link";
import { updateArticleOutboundLinkAction } from "@/app/admin/actions";
import { Card } from "@/components/ui";
import { getArticleOutboundLinks } from "@/lib/content";

const numberFormatter = new Intl.NumberFormat("en-US");

export default async function AdminAffiliateLinksPage() {
  const links = await getArticleOutboundLinks();

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-white">Affiliate links</h1>

      <div className="mt-8 space-y-4">
        {links.map((link) => (
          <Card key={link.id} className="p-5">
            <div className="flex flex-col gap-4 @min-[640px]:flex-row @min-[640px]:items-start @min-[640px]:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-(--color-brand-border) bg-(--color-brand-soft) px-2.5 py-1 text-[11px] font-bold text-(--color-brand-light)">
                    {numberFormatter.format(link.impressions)} impressions
                  </span>
                  <span className="text-xs text-slate-500">{link.label || "Unlabelled link"}</span>
                </div>
                <Link href={`/admin/articles/${link.articleSlug}/edit`} className="mt-3 block truncate font-bold text-white hover:text-(--color-brand-light)">
                  {link.articleTitle}
                </Link>
                <p className="mt-1 truncate font-mono text-[11px] text-slate-500" title={link.sourceUrl}>Source: {link.sourceUrl}</p>
              </div>
              <Link href={`/forums/${link.articleSlug}`} className="shrink-0 text-xs font-semibold text-slate-400 hover:text-white">View post ↗</Link>
            </div>

            <form action={updateArticleOutboundLinkAction} className="mt-5 flex flex-col gap-3 @min-[640px]:flex-row">
              <input type="hidden" name="id" value={link.id} />
              <input type="hidden" name="articleSlug" value={link.articleSlug} />
              <label className="min-w-0 flex-1">
                <span className="sr-only">Destination URL for {link.label}</span>
                <input
                  required
                  type="url"
                  name="destinationUrl"
                  defaultValue={link.destinationUrl}
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 font-mono text-xs text-white outline-none focus:border-(--color-brand-border)"
                />
              </label>
              <button className="rounded-lg bg-(--color-brand) px-4 py-2.5 text-xs font-bold text-white hover:bg-(--color-brand-hover)">Save link</button>
            </form>
          </Card>
        ))}

        {links.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm font-semibold text-slate-300">No post links have been captured yet.</p>
            <p className="mt-2 text-xs text-slate-500">Add an external link in the post editor and save the post to register it here.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
