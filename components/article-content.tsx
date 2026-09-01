import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { TrackedPostLink } from "@/components/tracked-post-link";
import { getAffiliateLinks, getArticleOutboundLinksBySlug } from "@/lib/content";

const affiliatePattern = /\{\{affiliate:([a-z0-9]+(?:-[a-z0-9]+)*)\|([^}]+)\}\}/g;

export async function ArticleContent({ body, slug }: { body: string; slug: string }) {
  const [links, outboundLinks] = await Promise.all([getAffiliateLinks(), getArticleOutboundLinksBySlug(slug)]);
  const affiliateMap = new Map(links.map((link) => [link.id, link]));
  const outboundMap = new Map(outboundLinks.map((link) => [link.sourceUrl, link]));
  const markdownComponents: Components = {
    a: ({ href, children }) => {
      const link = href ? outboundMap.get(href) : null;
      return link
        ? <TrackedPostLink id={link.id} href={link.destinationUrl}>{children}</TrackedPostLink>
        : <a href={href}>{children}</a>;
    },
  };
  const parts: Array<{ type: "markdown" | "affiliate"; value: string; label?: string }> = [];
  let cursor = 0;

  for (const match of body.matchAll(affiliatePattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ type: "markdown", value: body.slice(cursor, index) });
    parts.push({ type: "affiliate", value: match[1], label: match[2].trim() });
    cursor = index + match[0].length;
  }
  if (cursor < body.length) parts.push({ type: "markdown", value: body.slice(cursor) });

  return (
    <div className="article-content">
      {parts.map((part, index) => {
        if (part.type === "markdown") {
          return <ReactMarkdown key={index} remarkPlugins={[remarkGfm]} components={markdownComponents}>{part.value}</ReactMarkdown>;
        }

        const link = affiliateMap.get(part.value);
        if (!link?.enabled) return null;
        return (
          <div key={`${part.value}-${index}`} className="my-8 rounded-2xl border border-(--color-brand-border) bg-(--color-brand-soft) p-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-(--color-brand-light)">Recommended resource</p>
            <a
              href={`/go/${link.id}?source=article&article=${encodeURIComponent(slug)}`}
              rel="nofollow sponsored"
              className="mt-3 inline-flex rounded-xl border border-(--color-brand-border) bg-(--color-brand) px-4 py-3 text-sm font-bold text-white no-underline hover:bg-(--color-brand-hover)"
            >
              {part.label || link.label} →
            </a>
          </div>
        );
      })}
    </div>
  );
}
