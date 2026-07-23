"use client";

import { useState } from "react";
import { estimateServer, type Workload } from "@/lib/selector";

const initial: Workload = { application: "nextjs", traffic: "starter", containers: 3, database: true, storage: 40 };
const field = "w-full rounded-xl border border-white/10 bg-[#090c11] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50";

export function VpsSelector() {
  const [workload, setWorkload] = useState(initial);
  const [result, setResult] = useState<ReturnType<typeof estimateServer> | null>(null);
  const update = <K extends keyof Workload>(key: K, value: Workload[K]) => setWorkload((old) => ({ ...old, [key]: value }));

  return <div className="grid gap-7 lg:grid-cols-2">
    <form className="rounded-2xl border border-white/9 bg-[#11151c] p-7" onSubmit={(e)=>{e.preventDefault();setResult(estimateServer(workload));}}>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="text-sm text-slate-300">Application<select className={`${field} mt-2`} value={workload.application} onChange={(e)=>update("application",e.target.value as Workload["application"])}><option value="nextjs">Next.js</option><option value="docker">Docker stack</option><option value="wordpress">WordPress</option><option value="n8n">n8n</option></select></label>
        <label className="text-sm text-slate-300">Traffic<select className={`${field} mt-2`} value={workload.traffic} onChange={(e)=>update("traffic",e.target.value as Workload["traffic"])}><option value="starter">Starter</option><option value="growing">Growing</option><option value="busy">Busy / spiky</option></select></label>
        <label className="text-sm text-slate-300">Containers<input className={`${field} mt-2`} type="number" min="1" max="50" value={workload.containers} onChange={(e)=>update("containers",Number(e.target.value))}/></label>
        <label className="text-sm text-slate-300">Storage in GB<input className={`${field} mt-2`} type="number" min="20" step="10" value={workload.storage} onChange={(e)=>update("storage",Number(e.target.value))}/></label>
        <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2"><input type="checkbox" checked={workload.database} onChange={(e)=>update("database",e.target.checked)} className="size-4 accent-cyan-300"/>This server also runs PostgreSQL or MySQL</label>
      </div>
      <button type="submit" className="mt-7 w-full rounded-xl bg-cyan-300 px-5 py-3.5 font-semibold text-slate-950">Calculate starting point</button>
    </form>
    <section aria-live="polite" className="rounded-2xl border border-white/9 bg-gradient-to-br from-[#121923] to-[#0d1117] p-7">
      {!result ? <div className="flex min-h-80 flex-col items-center justify-center text-center"><span className="grid size-14 place-items-center rounded-2xl bg-cyan-300/10 font-mono text-cyan-300">?</span><h2 className="mt-5 text-xl font-semibold">Your recommendation appears here</h2><p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">A conservative starting point that you validate with monitoring after deployment.</p></div> : <div><p className="eyebrow">Recommended starting point</p><h2 className="mt-3 text-2xl font-semibold">Unmanaged KVM VPS</h2><div className="mt-7 grid grid-cols-3 gap-3">{[[result.cpu,"vCPU"],[`${result.ram} GB`,"RAM"],[`${result.storage} GB`,"Storage"]].map(([v,l])=><div key={l} className="rounded-xl border border-white/9 bg-black/15 p-4"><p className="text-2xl font-semibold">{v}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{l}</p></div>)}</div><div className="mt-7 space-y-3 text-sm leading-6 text-slate-400"><p>✓ Includes deployment and operating-system headroom.</p><p>✓ Database memory is budgeted separately when selected.</p><p>✓ Storage never drops below a practical system baseline.</p></div><p className="mt-8 border-t border-white/8 pt-5 text-xs leading-5 text-slate-600">This is an estimate, not a provider ranking. Measure the deployed workload before upgrading.</p></div>}
    </section>
  </div>;
}
