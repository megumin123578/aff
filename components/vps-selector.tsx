"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_WORKLOAD,
  WORKLOAD_PRESETS,
  estimateServer,
  validateWorkload,
  workloadFromSearchParams,
  workloadToSearchParams,
  type PresetId,
  type Workload,
} from "@/lib/selector";
import { Badge, Button, Card } from "@/components/ui";
import { ProviderRecommendations } from "@/components/provider-recommendations";

const inputClass =
  "mt-2 w-full cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none transition duration-200 hover:border-[var(--color-border-strong)] focus:border-[var(--color-brand-border)] focus:ring-2 focus:ring-[var(--color-brand-soft)]";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

const breakdownLabels = {
  application: "Application & traffic",
  database: "Database",
  containers: "Container allocation",
  overhead: "OS & deployment overhead",
};

export function VpsSelector() {
  const [workload, setWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [calculatedWorkload, setCalculatedWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [result, setResult] = useState(() => estimateServer(DEFAULT_WORKLOAD));
  const [selectedPreset, setSelectedPreset] = useState<PresetId | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [resultVersion, setResultVersion] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const calculationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const validation = validateWorkload(workload);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlHydrationTimer = window.setTimeout(() => {
      if (params.size > 0) {
        const sharedWorkload = workloadFromSearchParams(params);
        setWorkload(sharedWorkload);
        setCalculatedWorkload(sharedWorkload);
        setResult(estimateServer(sharedWorkload));
      }
    }, 0);

    return () => {
      window.clearTimeout(urlHydrationTimer);
      if (calculationTimer.current) clearTimeout(calculationTimer.current);
    };
  }, []);

  const update = <K extends keyof Workload>(key: K, value: Workload[K]) => {
    setWorkload((current) => ({ ...current, [key]: value }));
    setSelectedPreset(null);
    setCopyState("idle");
  };

  const applyPreset = (id: PresetId) => {
    const preset = WORKLOAD_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setWorkload({ ...preset.workload });
    setSelectedPreset(id);
    setCopyState("idle");
  };

  const syncUrl = (value: Workload) => {
    const query = workloadToSearchParams(value).toString();
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isCalculating || validation.errors.length > 0) return;

    setIsCalculating(true);
    setCopyState("idle");
    calculationTimer.current = setTimeout(() => {
      setResult(estimateServer(workload));
      setCalculatedWorkload(workload);
      setResultVersion((current) => current + 1);
      syncUrl(workload);
      setIsCalculating(false);
      calculationTimer.current = null;
    }, 650);
  };

  const reset = () => {
    if (calculationTimer.current) clearTimeout(calculationTimer.current);
    setWorkload(DEFAULT_WORKLOAD);
    setCalculatedWorkload(DEFAULT_WORKLOAD);
    setResult(estimateServer(DEFAULT_WORKLOAD));
    setSelectedPreset(null);
    setIsCalculating(false);
    setCopyState("idle");
    setResultVersion((current) => current + 1);
    calculationTimer.current = null;
    window.history.replaceState(null, "", window.location.pathname);
  };

  const copyResult = async () => {
    syncUrl(calculatedWorkload);
    const summary = [
      "Neroviax VPS estimate",
      `${result.cpu} vCPU · ${result.ram} GB RAM · ${result.storage} GB NVMe`,
      window.location.href,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
      <form className="h-full" onSubmit={handleSubmit} aria-busy={isCalculating} noValidate>
        <fieldset disabled={isCalculating} className="m-0 h-full min-w-0 border-0 p-0">
          <Card className="h-full w-full p-[clamp(18px,4vw,28px)]">
            <div className="space-y-6">
              <div className="flex flex-col items-start gap-3 border-b border-[var(--color-border)] pb-3.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <span className="text-lg font-bold text-white">Define Workload</span>
                <Badge variant="azure">VPS Calculator</Badge>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">Start with a preset</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {WORKLOAD_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      type="button"
                      size="small"
                      variant={selectedPreset === preset.id ? "azure" : "default"}
                      className="min-h-16 flex-col gap-0.5 px-2"
                      onClick={() => applyPreset(preset.id)}
                      aria-pressed={selectedPreset === preset.id}
                      title={preset.description}
                    >
                      <span>{preset.label}</span>
                      <span className="text-[9px] font-medium opacity-70">{preset.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Application Stack
                  <select
                    className={`${inputClass} font-sans`}
                    value={workload.application}
                    onChange={(event) => update("application", event.target.value as Workload["application"])}
                  >
                    <option value="nextjs">Next.js App</option>
                    <option value="docker">Docker Compose Stack</option>
                    <option value="wordpress">WordPress + PHP</option>
                    <option value="n8n">n8n Automation</option>
                    <option value="game">Game Server</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Traffic Volume
                  <select
                    className={`${inputClass} font-sans`}
                    value={workload.traffic}
                    onChange={(event) => update("traffic", event.target.value as Workload["traffic"])}
                  >
                    <option value="starter">Starter (0–10k visits)</option>
                    <option value="growing">Growing (10k–100k visits)</option>
                    <option value="busy">Busy / Spiky (100k+ visits)</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Environment
                  <select
                    className={`${inputClass} font-sans`}
                    value={workload.environment}
                    onChange={(event) => update("environment", event.target.value as Workload["environment"])}
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Sizing Priority
                  <select
                    className={`${inputClass} font-sans`}
                    value={workload.priority}
                    onChange={(event) => update("priority", event.target.value as Workload["priority"])}
                  >
                    <option value="economy">Economy</option>
                    <option value="balanced">Balanced</option>
                    <option value="performance">Performance</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Total Containers
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    max="100"
                    value={workload.containers}
                    aria-invalid={validation.errors.some((error) => error.startsWith("Containers"))}
                    onChange={(event) => update("containers", Number(event.target.value))}
                  />
                </label>

                <label className={labelClass}>
                  Storage Required (GB)
                  <input
                    className={inputClass}
                    type="number"
                    min="20"
                    max="4000"
                    step="10"
                    value={workload.storage}
                    aria-invalid={validation.errors.some((error) => error.startsWith("Storage"))}
                    onChange={(event) => update("storage", Number(event.target.value))}
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3.5 text-sm font-medium text-slate-200 transition-colors hover:bg-[var(--color-surface-muted)] sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={workload.database}
                    onChange={(event) => update("database", event.target.checked)}
                    className="size-4 cursor-pointer rounded accent-[var(--color-brand)]"
                  />
                  <span>This VPS also runs a database (PostgreSQL / MySQL)</span>
                </label>
              </div>

              {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                <div className="space-y-2" aria-live="polite">
                  {validation.errors.map((error) => (
                    <p key={error} className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-xs text-[var(--color-danger-text)]">{error}</p>
                  ))}
                  {validation.warnings.map((warning) => (
                    <p key={warning} className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-xs text-[var(--color-warning-text)]">{warning}</p>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                variant="azure"
                size="large"
                className="w-full"
                disabled={isCalculating || validation.errors.length > 0}
              >
                <span className="flex items-center justify-center gap-2">
                  {isCalculating && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
                  {isCalculating ? "Calculating…" : "Calculate VPS Starting Point →"}
                </span>
              </Button>
            </div>
          </Card>
        </fieldset>
      </form>

      <section className="h-full" aria-live="polite" aria-busy={isCalculating}>
        <Card className="flex h-full w-full flex-col p-[clamp(18px,4vw,28px)]">
          <div className="flex flex-col items-start gap-3 border-b border-[var(--color-border)] pb-3.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Recommendation</span>
              <h2 className="mt-1 text-xl font-bold text-white">Unmanaged KVM VPS</h2>
            </div>
            <Badge variant="mint">Optimal Baseline</Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 py-6 min-[420px]:grid-cols-3">
            {isCalculating
              ? ["vCPU Cores", "RAM Memory", "NVMe Storage"].map((label) => (
                  <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-center" role="status">
                    <span className="skeleton mx-auto block h-8 w-16 rounded-lg" />
                    <span className="skeleton mx-auto mt-2 block h-2.5 w-20 rounded" />
                    <span className="sr-only">Calculating {label}</span>
                  </div>
                ))
              : [
                  [result.cpu, "vCPU Cores"],
                  [`${result.ram} GB`, "RAM Memory"],
                  [`${result.storage} GB`, "NVMe Storage"],
                ].map(([value, label]) => (
                  <div key={`${resultVersion}-${label}`} className="result-in rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-center">
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                  </div>
                ))}
          </div>

          <div className={`space-y-5 transition-opacity ${isCalculating ? "opacity-40" : "opacity-100"}`}>
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">RAM allocation</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{result.rawRam} GB estimated before rounding to a VPS tier</p>
                </div>
                <span className="text-xs font-semibold text-[var(--color-brand-light)]">{result.ram} GB tier</span>
              </div>
              <div className="space-y-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                {(Object.keys(breakdownLabels) as Array<keyof typeof breakdownLabels>).map((key) => (
                  <div key={key} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-400">{breakdownLabels[key]}</span>
                    <span className="font-semibold text-slate-100">{result.breakdown[key]} GB</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <h3 className="text-sm font-bold text-white">Why this configuration?</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
                {result.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2"><span aria-hidden="true" className="text-[var(--color-success)]">✓</span><span>{reason}</span></li>
                ))}
              </ul>
            </div>

            {result.warnings.length > 0 && (
              <div className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-4">
                <h3 className="text-sm font-bold text-[var(--color-warning-text)]">Capacity notes</h3>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--color-warning-text)] opacity-80">
                  {result.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row">
            <Button type="button" className="flex-1" onClick={reset}>Reset</Button>
            <Button type="button" variant="mint" className="flex-1" onClick={copyResult} disabled={isCalculating}>
              {copyState === "copied" ? "Copied result ✓" : copyState === "error" ? "Copy failed" : "Copy result & link"}
            </Button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Baseline estimate only. Verify CPU, memory and disk metrics with production monitoring after deployment.
          </p>
        </Card>
      </section>
      </div>

      <ProviderRecommendations
        estimate={result}
        isLoading={isCalculating}
        resultVersion={resultVersion}
      />
    </div>
  );
}
