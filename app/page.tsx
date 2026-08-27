import Link from "next/link";
import { Badge, Card, Chip, LinkButton } from "@/components/ui";
import { getPublishedArticles } from "@/lib/content";
import type { Metadata } from "next";
import { absoluteUrl, jsonLd, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Neroviax — Practical Tech, Hardware & Workspace Gear",
  description: "Curated tech gear, in-depth reviews, homelab hardware, and minimalist desk setups for developers and builders.",
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

const categories = [
  {
    icon: "🖥️",
    title: "Desk Setup & Displays",
    description: "4K/5K monitors, monitor arms, ergonomic standing desks, and cable management setups.",
    tag: "Desk Setup",
  },
  {
    icon: "⌨️",
    title: "Keyboards & Mice",
    description: "Custom mechanical keyboards, quiet tactile switches for office, and ergonomic mice.",
    tag: "Keyboards",
  },
  {
    icon: "💻",
    title: "Mini PC & Homelab",
    description: "Mac Mini M4, low-power Mini PCs, NAS storage, and local home server configurations.",
    tag: "Homelab",
  },
  {
    icon: "🎧",
    title: "Audio & Accessories",
    description: "Noise-cancelling headphones, GaN chargers, USB-C docking hubs, and daily essentials.",
    tag: "Audio",
  },
];

export default async function Home() {
  const guides = (await getPublishedArticles()).slice(0, 6);

  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@graph": [
            organizationJsonLd,
            {
              "@type": "WebSite",
              "@id": absoluteUrl("/#website"),
              name: "Neroviax",
              url: absoluteUrl("/"),
              publisher: { "@id": absoluteUrl("/#organization") },
            },
          ],
        })}
      />

      {/* Hero Section */}
      <section className="hero">
        <div className="relative z-10 grid w-full items-center gap-12 px-5 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge variant="azure">Tested by Engineers</Badge>
              <Badge>Honest Reviews & Benchmarks</Badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.08] font-sans">
              Practical Tech & Gear.<br />
              <span className="text-slate-400">Built for Builders.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 font-normal">
              In-depth reviews, benchmarked developer hardware, homelab configurations, and minimalist desk setups. No marketing fluff, transparent affiliate disclosures, and real-world testing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LinkButton
                href="/articles"
                variant="mint"
                size="large"
                className="border-[#12955d] bg-[#087a4b] text-white hover:bg-[#06633d]"
              >
                Read Our Blog →
              </LinkButton>
              <LinkButton href="#categories" size="large">
                Explore Tech Gear
              </LinkButton>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Chip active>Real-world Benchmarks</Chip>
              <Chip>Transparent Affiliates</Chip>
              <Chip>Community Q&A Discussions</Chip>
            </div>
          </div>

          {/* Option 1: Code Block UI preview for desk-setup.json */}
          <div className="w-full">
            <Card className="overflow-hidden border-[#2d3541] bg-[#0d1119] p-0 shadow-[0_24px_60px_rgb(0_0_0_/_0.28)]">
              <div className="flex items-center justify-between border-b border-[#28303b] px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#e06666]" />
                  <span className="size-2.5 rounded-full bg-[#d7b657]" />
                  <span className="size-2.5 rounded-full bg-[#58bc8c]" />
                </div>
                <span className="font-mono text-[10px] tracking-wide text-[#6f9ed9] sm:text-xs">
                  desk-setup.json
                </span>
              </div>
              <pre className="overflow-x-auto px-4 py-5 font-mono text-[11px] font-medium leading-[2.15] text-[#e7efff] sm:px-5 sm:py-6 sm:text-xs">
                <code>{`{
  profile: "minimalist_developer_2026",
  target_budget: "Under $1,500",
  hardware: {
    display: "Dell UltraSharp 27\" 4K (Type-C 90W)",
    keyboard: "Keychron Q1 Pro (Gateron Jupiter Brown)",
    mouse: "Logitech MX Master 3S",
    home_server: "Mac Mini M4 (16GB RAM / 256GB SSD)"
  },
  cable_management: "100% hidden under-desk",
  verdict: "9.6/10 · Tested for 8h+ daily coding"
}`}</code>
              </pre>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Gear Categories Section */}
      <section id="categories" className="w-full px-5 py-20 lg:px-8">
        <div className="mb-10">
          <Badge variant="azure">Curated Categories</Badge>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Explore by Gear & Topic
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Handpicked hardware, setup recommendations, and accessories tested for productivity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.title} href={`/articles?category=${encodeURIComponent(cat.tag)}`}>
              <Card className="h-full p-6 transition duration-200 hover:border-[var(--color-border-strong)] hover:bg-[#121722]">
                <div className="text-3xl">{cat.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-white">{cat.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {cat.description}
                </p>
                <p className="mt-4 font-mono text-xs font-semibold text-[var(--color-brand-light)]">
                  Browse category →
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section id="guides" className="w-full border-t border-[var(--color-border)] px-5 py-20 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="mb-2">
              <Badge>From the Blog</Badge>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Latest Blog Posts & Reviews
            </h2>
          </div>
          <Chip active>{guides.length} {guides.length === 1 ? "Post" : "Posts"} Available</Chip>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {guides.map((guide, i) => (
            <Card key={guide.slug} className="h-full p-6">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    0{i + 1} · {guide.category}
                  </span>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-white">
                    {guide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {guide.description}
                  </p>
                </div>
                <div className="mt-6">
                  <LinkButton href={`/articles/${guide.slug}`} size="small">
                    Read post & discussion →
                  </LinkButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <LinkButton href="/articles">Browse all blog posts →</LinkButton>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="method" className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="w-full px-5 py-20 lg:px-8">
          <Badge variant="azure">Our Philosophy</Badge>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-white leading-snug">
            Buy real gear. Test real workloads. Document the trade-offs.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            Every product recommendation on Neroviax is based on practical ergonomics, durability, and performance value. We disclose all affiliate partnerships transparently so developers and builders can make informed decisions.
          </p>
        </div>
      </section>
    </main>
  );
}
