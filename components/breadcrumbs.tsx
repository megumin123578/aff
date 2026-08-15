import Link from "next/link";
import { breadcrumbJsonLd, jsonLd } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: Array<{ name: string; path: string }> }) {
  return <>
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-slate-400">
      {items.map((item, index) => <span key={item.path} className="flex items-center gap-2">
        {index > 0 && <span aria-hidden="true">/</span>}
        {index === items.length - 1 ? <span aria-current="page" className="text-slate-300">{item.name}</span> : <Link href={item.path} className="hover:text-white">{item.name}</Link>}
      </span>)}
    </nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd(items))} />
  </>;
}
