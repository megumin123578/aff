import Link from "next/link";

const guides = [
  {
    tag: "VPS sizing",
    title: "How much server does a Docker stack actually need?",
    copy: "A practical baseline for RAM, CPU, storage, and deployment headroom without provider bloat.",
  },
  {
    tag: "Self-hosting",
    title: "VPS vs home server: the real trade-offs",
    copy: "Compare uptime reliability, storage expansion, networking, maintenance, and true monthly cost.",
  },
  {
    tag: "Security",
    title: "The first hour on a new Ubuntu VPS",
    copy: "A sensible, battle-tested hardening checklist that protects your server without locking you out.",
  },
];

export default function Home() {
  return (
    <main className="relative">
      {/* Jelly Hero Section */}
      <section className="jelly-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_.9fr] lg:px-8 relative z-10">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <jelly-badge variant="azure">Infrastructure without guesswork</jelly-badge>
              <jelly-badge>Open Source Tools</jelly-badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.08] font-sans">
              Run your project.<br />
              <span className="text-slate-400">Not a server farm.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 font-normal">
              Practical VPS, self-hosting, and homelab guides for developers. Pick the right server resources, deploy a reliable stack, and keep the monthly hosting bill honest.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/tools/vps-selector">
                <jelly-button variant="mint" size="large">
                  Size my VPS →
                </jelly-button>
              </Link>
              <a href="#guides">
                <jelly-button size="large">
                  Browse field guides
                </jelly-button>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <jelly-chip active>No Account Required</jelly-chip>
              <jelly-chip>Open Workload Estimates</jelly-chip>
              <jelly-chip>Real-world RAM/vCPU Formulas</jelly-chip>
            </div>
          </div>

          {/* Workload Estimate Jelly Card */}
          <div className="w-full">
            <jelly-card squish style={{ padding: "28px", width: "100%" }}>
              <div className="grid gap-6">
                <div className="flex items-center justify-between border-b border-[#343A46] pb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">Workload Estimate</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Next.js + PostgreSQL + Proxy</p>
                  </div>
                  <jelly-badge variant="mint">balanced stack</jelly-badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[["2", "vCPU"], ["4 GB", "RAM"], ["80 GB", "NVMe"]].map(([v, l]) => (
                    <div key={l} className="rounded-xl border border-[#343A46] bg-[#181B1D] p-3 text-center">
                      <p className="text-xl font-bold text-white">{v}</p>
                      <p className="mt-1 text-[10px] uppercase font-mono tracking-wider text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Reverse proxy (Traefik / NGINX)</span>
                    <jelly-switch checked label="Active"></jelly-switch>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Application container (Next.js)</span>
                    <jelly-switch checked label="Active"></jelly-switch>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">PostgreSQL database</span>
                    <jelly-checkbox checked></jelly-checkbox>
                  </div>
                </div>
              </div>
            </jelly-card>
          </div>
        </div>
      </section>

      {/* Field Guides Section */}
      <section id="guides" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="mb-2">
              <jelly-badge>Start with the evidence</jelly-badge>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Field notes for small infrastructure</h2>
          </div>
          <jelly-chip active>3 Field Guides Active</jelly-chip>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {guides.map((g, i) => (
            <jelly-card squish key={g.title} style={{ padding: "24px", height: "100%" }}>
              <div className="flex flex-col justify-between h-full">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-400">0{i + 1} · {g.tag}</span>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-white">{g.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{g.copy}</p>
                </div>
                <div className="mt-6">
                  <jelly-button size="small">
                    Read guide series →
                  </jelly-button>
                </div>
              </div>
            </jelly-card>
          ))}
        </div>
      </section>

      {/* Method Section */}
      <section id="method" className="border-y border-[#343A46] bg-[#1E222A]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <jelly-badge variant="azure">Our Method</jelly-badge>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-white leading-snug">
            Benchmark the workload, document the bill, explain the trade-off.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            No single provider is best for everyone. Veynor starts with the project specs and publishes transparent assumptions so developers can reproduce and validate every hosting decision.
          </p>
        </div>
      </section>
    </main>
  );
}
