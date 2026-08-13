"use client";

import { useEffect, useRef, useState } from "react";
import { estimateServer, type Workload } from "@/lib/selector";

const initial: Workload = {
  application: "nextjs",
  traffic: "starter",
  containers: 3,
  database: true,
  storage: 40,
};

const inputClass =
  "w-full rounded-xl border border-[#343A46] bg-[#181B1D] px-4 py-3 text-sm text-white outline-none focus:border-[#0077CC] transition-all duration-200 cursor-pointer";

export function VpsSelector() {
  const [workload, setWorkload] = useState<Workload>(initial);
  const [result, setResult] = useState<ReturnType<typeof estimateServer>>(() => estimateServer(initial));
  const [isCalculating, setIsCalculating] = useState(false);
  const calculationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (calculationTimer.current) clearTimeout(calculationTimer.current);
    };
  }, []);

  const update = <K extends keyof Workload>(key: K, value: Workload[K]) => {
    setWorkload((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCalculating) return;

    setIsCalculating(true);
    calculationTimer.current = setTimeout(() => {
      setResult(estimateServer(workload));
      setIsCalculating(false);
      calculationTimer.current = null;
    }, 650);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form Input Section */}
      <form onSubmit={handleSubmit} aria-busy={isCalculating}>
        <fieldset disabled={isCalculating} className="m-0 min-w-0 border-0 p-0">
          <jelly-card squish style={{ padding: "clamp(18px, 4vw, 28px)", width: "100%" }}>
            <div className="space-y-5">
            <div className="flex flex-col items-start gap-3 border-b border-[#343A46] pb-3.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
              <span className="font-bold text-white text-lg">Define Workload</span>
              <jelly-badge variant="azure">VPS Calculator</jelly-badge>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Application Stack
                <select
                  className={`${inputClass} mt-2 font-sans`}
                  value={workload.application}
                  onChange={(e) => update("application", e.target.value as Workload["application"])}
                >
                  <option value="nextjs" className="bg-[#181B1D]">Next.js App</option>
                  <option value="docker" className="bg-[#181B1D]">Docker Compose Stack</option>
                  <option value="wordpress" className="bg-[#181B1D]">WordPress + PHP</option>
                  <option value="n8n" className="bg-[#181B1D]">n8n Automation</option>
                </select>
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Traffic Volume
                <select
                  className={`${inputClass} mt-2 font-sans`}
                  value={workload.traffic}
                  onChange={(e) => update("traffic", e.target.value as Workload["traffic"])}
                >
                  <option value="starter" className="bg-[#181B1D]">Starter (0 - 10k visits)</option>
                  <option value="growing" className="bg-[#181B1D]">Growing (10k - 100k visits)</option>
                  <option value="busy" className="bg-[#181B1D]">Busy / Spiky (100k+ visits)</option>
                </select>
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Total Containers
                <input
                  className={`${inputClass} mt-2`}
                  type="number"
                  min="1"
                  max="50"
                  value={workload.containers}
                  onChange={(e) => update("containers", Number(e.target.value))}
                />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Storage Required (GB)
                <input
                  className={`${inputClass} mt-2`}
                  type="number"
                  min="20"
                  step="10"
                  value={workload.storage}
                  onChange={(e) => update("storage", Number(e.target.value))}
                />
              </label>

              <label className="flex items-center gap-3 text-sm font-medium text-slate-200 sm:col-span-2 cursor-pointer bg-[#181B1D] border border-[#343A46] rounded-xl p-3.5 hover:bg-[#262B34] transition-colors">
                <input
                  type="checkbox"
                  checked={workload.database}
                  onChange={(e) => update("database", e.target.checked)}
                  className="size-4 rounded accent-[#0077CC] cursor-pointer"
                />
                <span>This VPS also runs database (PostgreSQL / MySQL)</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isCalculating}
                className="block w-full cursor-pointer appearance-none rounded-xl border-0 bg-transparent p-0 text-inherit outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[#4DA6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181B1D] disabled:cursor-wait disabled:opacity-75"
              >
                <jelly-button
                  variant="azure"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isCalculating && (
                      <span
                        aria-hidden="true"
                        className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                      />
                    )}
                    {isCalculating ? "Calculating…" : "Calculate VPS Starting Point →"}
                  </span>
                </jelly-button>
              </button>
            </div>
            </div>
          </jelly-card>
        </fieldset>
      </form>

      {/* Recommendation Results Section */}
      <section aria-live="polite">
        <jelly-card squish style={{ padding: "clamp(18px, 4vw, 28px)", width: "100%", height: "100%" }}>
          <div className="space-y-5">
            <div className="flex flex-col items-start gap-3 border-b border-[#343A46] pb-3.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-slate-400 font-semibold tracking-wider">Recommendation</span>
                <h2 className="mt-1 text-xl font-bold text-white">Unmanaged KVM VPS</h2>
              </div>
              <jelly-badge variant="mint">Optimal Baseline</jelly-badge>
            </div>

            <div className="grid grid-cols-1 gap-3 py-2 min-[420px]:grid-cols-3">
              {[
                [result.cpu, "vCPU Cores"],
                [`${result.ram} GB`, "RAM Memory"],
                [`${result.storage} GB`, "NVMe Storage"],
              ].map(([val, label]) => (
                <div key={label} className="rounded-xl border border-[#343A46] bg-[#181B1D] p-4 text-center">
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 rounded-xl bg-[#181B1D] p-4 border border-[#343A46] text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <span className="text-slate-300 font-bold">✓</span> Includes OS & deployment overhead headroom
              </p>
              <p className="flex items-center gap-2">
                <span className="text-slate-300 font-bold">✓</span> Database memory budgeted separately when enabled
              </p>
              <p className="flex items-center gap-2">
                <span className="text-slate-300 font-bold">✓</span> Minimum 25-40GB NVMe storage baseline enforced
              </p>
            </div>

            <p className="border-t border-[#343A46] pt-3.5 text-xs leading-relaxed text-slate-500">
              Note: This is a workload baseline estimate. Measure server metrics with monitoring after deploying your stack.
            </p>
          </div>
        </jelly-card>
      </section>
    </div>
  );
}
