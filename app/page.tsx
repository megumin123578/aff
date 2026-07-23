import Link from "next/link";

const guides = [
  ["VPS sizing", "How much server does a Docker stack actually need?", "A practical baseline for RAM, CPU, storage, and deployment headroom."],
  ["Self-hosting", "VPS vs home server: the real trade-offs", "Compare reliability, storage, networking, maintenance, and total cost."],
  ["Security", "The first hour on a new Ubuntu VPS", "A sensible hardening checklist that does not lock you out of the server."],
];

export default function Home() {
  return <main>
    <section className="relative isolate overflow-hidden border-b border-white/8">
      <div className="grid-fade absolute inset-0 -z-10" /><div className="absolute left-1/2 top-10 -z-10 size-[550px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-30">
        <div><p className="eyebrow">Infrastructure, without the guesswork</p><h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-.055em] text-white sm:text-7xl">Run your project.<br/><span className="text-slate-500">Not a server farm.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">Practical VPS, self-hosting, and homelab guides for developers. Pick the right resources, deploy a reliable stack, and keep the monthly bill honest.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/tools/vps-selector" className="rounded-xl bg-cyan-300 px-5 py-3.5 font-semibold text-slate-950">Size my VPS →</Link><a href="#guides" className="rounded-xl border border-white/12 bg-white/4 px-5 py-3.5 font-medium">Browse field guides</a></div></div>
        <div className="rounded-3xl border border-white/12 bg-[#10151d] p-6 shadow-2xl shadow-black/40"><div className="flex items-center justify-between border-b border-white/8 pb-5"><div><p className="font-medium">Workload estimate</p><p className="mt-1 text-xs text-slate-500">Next.js + PostgreSQL + proxy</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">balanced</span></div><div className="grid grid-cols-3 gap-3 py-6">{[["2","vCPU"],["4 GB","RAM"],["80 GB","NVMe"]].map(([v,l])=><div key={l} className="rounded-xl border border-white/8 bg-white/[.025] p-4"><p className="text-xl font-semibold">{v}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{l}</p></div>)}</div>{["Reverse proxy","Application container","PostgreSQL database"].map((item,i)=><div key={item} className="mb-3 flex items-center gap-3 rounded-xl bg-[#090c11] px-4 py-3 text-sm text-slate-300"><span className="font-mono text-xs text-cyan-300">0{i+1}</span>{item}<span className="ml-auto size-2 rounded-full bg-emerald-400"/></div>)}</div>
      </div>
    </section>
    <section id="guides" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><p className="eyebrow">Start with the evidence</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">Field notes for small infrastructure</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{guides.map(([tag,title,copy],i)=><article key={title} className="rounded-2xl border border-white/9 bg-[#11151c] p-6"><span className="font-mono text-xs text-cyan-300">0{i+1} · {tag}</span><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{copy}</p><p className="mt-6 text-sm text-cyan-300">Coming in the first field series →</p></article>)}</div></section>
    <section id="method" className="border-y border-white/8 bg-[#0d1117]"><div className="mx-auto max-w-7xl px-5 py-18 lg:px-8"><p className="eyebrow">Our method</p><h2 className="mt-4 max-w-2xl text-4xl font-semibold">Benchmark the workload, document the bill, explain the trade-off.</h2><p className="mt-5 max-w-2xl leading-7 text-slate-400">No provider is best for everyone. Root & Rack starts with the project and publishes assumptions so readers can reproduce the decision.</p></div></section>
  </main>;
}
