import { Badge, Card, CheckboxIndicator, Chip, LinkButton, SwitchIndicator } from "@/components/ui";
import { getPublishedArticles } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const guides = (await getPublishedArticles()).slice(0, 3);
  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_.9fr] lg:px-8 relative z-10">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge variant="azure">Infrastructure without guesswork</Badge>
              <Badge>Open Source Tools</Badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.08] font-sans">
              Run your project.<br />
              <span className="text-slate-400">Not a server farm.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 font-normal">
              Practical VPS, self-hosting, and homelab guides for developers. Pick the right server resources, deploy a reliable stack, and keep the monthly hosting bill honest.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LinkButton href="/tools/vps-selector" variant="mint" size="large">
                Size my VPS →
              </LinkButton>
              <LinkButton href="#guides" size="large">
                Browse field guides
              </LinkButton>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Chip active>No Account Required</Chip>
              <Chip>Open Workload Estimates</Chip>
              <Chip>Real-world RAM/vCPU Formulas</Chip>
            </div>
          </div>

          {/* Workload Estimate Card */}
          <div className="w-full">
            <Card className="w-full p-7">
              <div className="grid gap-6">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">Workload Estimate</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Next.js + PostgreSQL + Proxy</p>
                  </div>
                  <Badge variant="mint">balanced stack</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[["2", "vCPU"], ["4 GB", "RAM"], ["80 GB", "NVMe"]].map(([v, l]) => (
                    <div key={l} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
                      <p className="text-xl font-bold text-white">{v}</p>
                      <p className="mt-1 text-[10px] uppercase font-mono tracking-wider text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Reverse proxy (Traefik / NGINX)</span>
                    <SwitchIndicator />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Application container (Next.js)</span>
                    <SwitchIndicator />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">PostgreSQL database</span>
                    <CheckboxIndicator />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Field Guides Section */}
      <section id="guides" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="mb-2">
              <Badge>Start with the evidence</Badge>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Field notes for small infrastructure</h2>
          </div>
          <Chip active>{guides.length} Field {guides.length === 1 ? "Guide" : "Guides"} Active</Chip>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {guides.map((guide, i) => (
            <Card key={guide.slug} className="h-full p-6">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-400">0{i + 1} · {guide.category}</span>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-white">{guide.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{guide.description}</p>
                </div>
                <div className="mt-6">
                  <LinkButton href={`/articles/${guide.slug}`} size="small">
                    Read guide series →
                  </LinkButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <LinkButton href="/articles">Browse all field guides →</LinkButton>
        </div>
      </section>

      {/* Method Section */}
      <section id="method" className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Badge variant="azure">Our Method</Badge>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-white leading-snug">
            Benchmark the workload, document the bill, explain the trade-off.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            No single provider is best for everyone. Neroviax starts with the project specs and publishes transparent assumptions so developers can reproduce and validate every hosting decision.
          </p>
        </div>
      </section>
    </main>
  );
}
