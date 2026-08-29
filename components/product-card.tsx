import Image from "next/image";
import { Badge, Card } from "@/components/ui";

export interface ProductAffiliateLink {
  platform: "amazon" | "bestbuy" | "bhphoto" | "direct" | "other";
  label: string;
  url: string;
  isBestPrice?: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductProps {
  id?: string;
  name: string;
  brand: string;
  category?: string;
  rating?: number; // e.g. 9.4
  priceText?: string; // e.g. "$129" or "$499 - $599"
  imageUrl?: string;
  summary?: string;
  specs?: ProductSpec[];
  pros?: string[];
  cons?: string[];
  affiliateLinks?: ProductAffiliateLink[];
}

const platformStyles: Record<ProductAffiliateLink["platform"], { bg: string; text: string; hover: string }> = {
  amazon: {
    bg: "bg-[#ff9900] border-[#ff9900]",
    text: "text-slate-950 font-extrabold",
    hover: "hover:bg-[#e68a00]",
  },
  bestbuy: {
    bg: "bg-[#0046be] border-[#0046be]",
    text: "text-white font-bold",
    hover: "hover:bg-[#003da6]",
  },
  bhphoto: {
    bg: "bg-[#b30000] border-[#b30000]",
    text: "text-white font-bold",
    hover: "hover:bg-[#990000]",
  },
  direct: {
    bg: "bg-[var(--color-brand)] border-[var(--color-brand-border)]",
    text: "text-white font-bold",
    hover: "hover:bg-[var(--color-brand-hover)]",
  },
  other: {
    bg: "bg-[var(--color-action)] border-[var(--color-border-strong)]",
    text: "text-white font-bold",
    hover: "hover:bg-[var(--color-action-hover)]",
  },
};

export function ProductCard({
  name,
  brand,
  category,
  rating,
  priceText,
  imageUrl,
  summary,
  specs = [],
  pros = [],
  cons = [],
  affiliateLinks = [],
}: ProductProps) {
  return (
    <Card className="my-8 overflow-hidden border-[#2d3541] bg-[#0d1119] p-6 shadow-xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
              {brand}
            </span>
            {category && <Badge variant="azure">{category}</Badge>}
            {rating && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#102a1c] px-2 py-0.5 font-mono text-xs font-bold text-[#58bc8c]">
                ★ {rating.toFixed(1)} / 10
              </span>
            )}
          </div>

          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {name}
          </h3>

          {priceText && (
            <p className="mt-2 font-mono text-lg font-bold text-[#6f9ed9]">
              {priceText}
            </p>
          )}

          {summary && (
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {summary}
            </p>
          )}
        </div>

        {imageUrl && (
          <div className="relative size-32 shrink-0 overflow-hidden rounded-xl border border-(--color-border) bg-[var(--color-bg)]">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain p-2"
              sizes="128px"
            />
          </div>
        )}
      </div>

      {specs.length > 0 && (
        <div className="mt-6 border-t border-[#232a35] pt-5">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
            Key Specifications
          </h4>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 font-mono text-xs">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-lg border border-[#28303b] bg-[#141a24] p-2.5"
              >
                <dt className="text-slate-500">{spec.label}</dt>
                <dd className="mt-1 font-semibold text-slate-200">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {(pros.length > 0 || cons.length > 0) && (
        <div className="mt-6 grid gap-4 border-t border-[#232a35] pt-5 sm:grid-cols-2">
          {pros.length > 0 && (
            <div className="rounded-xl border border-[#163824] bg-[#0c1f14] p-4">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-[#58bc8c]">
                ✔ Advantages
              </h5>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-200">
                {pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#58bc8c]">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cons.length > 0 && (
            <div className="rounded-xl border border-[#3b1c1c] bg-[#221010] p-4">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-[#e06666]">
                ✖ Trade-offs
              </h5>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-200">
                {cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#e06666]">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {affiliateLinks.length > 0 && (
        <div className="mt-6 border-t border-[#232a35] pt-5">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400">
            Check current prices & retailer availability:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {affiliateLinks.map((link) => {
              const style = platformStyles[link.platform] || platformStyles.other;
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition shadow-sm ${style.bg} ${style.text} ${style.hover}`}
                >
                  <span>{link.label}</span>
                  {link.isBestPrice && (
                    <span className="rounded bg-black/25 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      Best Value
                    </span>
                  )}
                  <span aria-hidden="true">→</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
