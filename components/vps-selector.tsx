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
import type { CatalogPlan } from "@/lib/catalog-types";
import { trackEvent } from "@/lib/client-analytics";

const inputClass =
  "mt-2 w-full cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none transition duration-200 hover:border-[var(--color-border-strong)] focus:border-[var(--color-brand-border)] focus:ring-2 focus:ring-[var(--color-brand-soft)]";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

const breakdownLabels = {
  application: "Application & traffic",
  database: "Database",
  redis: "Redis / cache",
  workers: "Workers & cron jobs",
  containers: "Container allocation",
  overhead: "OS & deployment overhead",
};

export function VpsSelector({ plans }: { plans: CatalogPlan[] }) {
  const [workload, setWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [calculatedWorkload, setCalculatedWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [result, setResult] = useState(() => estimateServer(DEFAULT_WORKLOAD));
  const [selectedPreset, setSelectedPreset] = useState<PresetId | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [resultVersion, setResultVersion] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedUrl, setSavedUrl] = useState("");
  const calculationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);
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
      if (params.get("source") === "guide") trackEvent("guide_to_selector", { source: "guide" });
    }, 0);

    return () => {
      window.clearTimeout(urlHydrationTimer);
      if (calculationTimer.current) clearTimeout(calculationTimer.current);
    };
  }, []);

  const update = <K extends keyof Workload>(key: K, value: Workload[K]) => {
    if (!started.current) {
      started.current = true;
      trackEvent("selector_started", { firstField: key });
    }
    setWorkload((current) => ({ ...current, [key]: value }));
    setSelectedPreset(null);
    setCopyState("idle");
    setSaveState("idle");
    setSavedUrl("");
  };

  const applyPreset = (id: PresetId) => {
    const preset = WORKLOAD_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    if (!started.current) {
      started.current = true;
      trackEvent("selector_started", { firstField: "preset", preset: id });
    }
    setWorkload({ ...preset.workload });
    setSelectedPreset(id);
    setCopyState("idle");
    setSaveState("idle");
    setSavedUrl("");
  };

  const syncUrl = (value: Workload) => {
    const query = workloadToSearchParams(value).toString();
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isCalculating || validation.errors.length > 0) return;

    setIsCalculating(true);
    trackEvent("selector_completed", { application: workload.application, region: workload.region, budget: workload.budget, bandwidth: workload.bandwidth });
    setCopyState("idle");
    setSaveState("idle");
    setSavedUrl("");
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
    setSaveState("idle");
    setSavedUrl("");
    setResultVersion((current) => current + 1);
    calculationTimer.current = null;
    window.history.replaceState(null, "", window.location.pathname);
  };

  const copyResult = async () => {
    syncUrl(calculatedWorkload);
    const summary = [
      "Neroviax VPS estimate",
      `Minimum: ${result.minimum.cpu} vCPU · ${result.minimum.ram} GB RAM · ${result.minimum.storage} GB storage`,
      `Recommended: ${result.recommended.cpu} vCPU · ${result.recommended.ram} GB RAM · ${result.recommended.storage} GB storage · ${result.recommended.bandwidth} TB transfer`,
      `${calculatedWorkload.region} region · $${calculatedWorkload.budget}/month budget`,
      window.location.href,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  const savePermanentResult = async () => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/recommendations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: workloadToSearchParams(calculatedWorkload).toString() }) });
      if (!response.ok) throw new Error("Save failed");
      const payload = await response.json() as { url: string };
      setSavedUrl(payload.url);
      setSaveState("saved");
      trackEvent("recommendation_saved", { formulaVersion: result.formulaVersion });
    } catch {
      setSaveState("error");
    }
  };

  return (
    <div className="space-y-12">
      <section aria-label="Workload presets">
        {selectedPreset && <div className="mb-4 flex justify-end"><Badge variant="azure">Preset applied</Badge></div>}
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
              disabled={isCalculating}
            >
              <span>{preset.label}</span>
              <span className="text-[9px] font-medium opacity-70">{preset.description}</span>
            </Button>
          ))}
        </div>
      </section>

      <div className="grid items-stretch gap-8 lg:grid-cols-2">
      <form className="h-full" onSubmit={handleSubmit} aria-busy={isCalculating} noValidate>
        <fieldset disabled={isCalculating} className="m-0 h-full min-w-0 border-0 p-0">
          <Card className="h-full w-full p-[clamp(18px,4vw,28px)]">
            <div className="space-y-6">
              <div className="flex flex-col items-start gap-3 border-b border-[var(--color-border)] pb-3.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <span className="text-lg font-bold text-white">Define Workload</span>
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
                  Framework / Runtime
                  <select className={`${inputClass} font-sans`} value={workload.runtime} onChange={(event) => update("runtime", event.target.value as Workload["runtime"])}>
                    <option value="nodejs">Node.js</option><option value="php">PHP</option><option value="python">Python</option><option value="java">Java / JVM</option><option value="go">Go</option><option value="dotnet">.NET</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Requests / Minute
                  <input className={inputClass} type="number" min="0" max="1000000" step="100" value={workload.requestsPerMinute} onChange={(event) => update("requestsPerMinute", Number(event.target.value))} />
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

                <label className={labelClass}>
                  Upload / File Storage (GB)
                  <input className={inputClass} type="number" min="0" max="10000" step="10" value={workload.uploadsStorage} onChange={(event) => update("uploadsStorage", Number(event.target.value))} />
                </label>

                <label className={labelClass}>
                  Database
                  <select className={`${inputClass} font-sans`} value={workload.databaseType} onChange={(event) => { const value = event.target.value as Workload["databaseType"]; update("databaseType", value); setWorkload((current) => ({ ...current, database: value !== "none", databaseSize: value === "none" ? 0 : Math.max(current.databaseSize, 10) })); }}>
                    <option value="none">No local database</option><option value="postgresql">PostgreSQL</option><option value="mysql">MySQL / MariaDB</option><option value="mongodb">MongoDB</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Database Size (GB)
                  <input className={inputClass} type="number" min="0" max="10000" step="5" disabled={workload.databaseType === "none"} value={workload.databaseType === "none" ? 0 : workload.databaseSize} onChange={(event) => update("databaseSize", Number(event.target.value))} />
                </label>

                <label className={labelClass}>
                  Database Load
                  <select className={`${inputClass} font-sans`} disabled={workload.databaseType === "none"} value={workload.databaseLoad} onChange={(event) => update("databaseLoad", event.target.value as Workload["databaseLoad"])}>
                    <option value="light">Light</option><option value="moderate">Moderate</option><option value="heavy">Heavy</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Background Workers
                  <input className={inputClass} type="number" min="0" max="100" value={workload.workers} onChange={(event) => update("workers", Number(event.target.value))} />
                </label>

                <label className={labelClass}>
                  Cron Jobs
                  <input className={inputClass} type="number" min="0" max="1000" value={workload.cronJobs} onChange={(event) => update("cronJobs", Number(event.target.value))} />
                </label>

                <label className={labelClass}>
                  Preferred Region
                  <select
                    className={`${inputClass} font-sans`}
                    value={workload.region}
                    onChange={(event) => update("region", event.target.value as Workload["region"])}
                  >
                    <option value="any">Any region</option>
                    <option value="europe">Europe</option>
                    <option value="north-america">North America</option>
                    <option value="asia-pacific">Asia Pacific</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Monthly Transfer (TB)
                  <input
                    className={inputClass}
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={workload.bandwidth}
                    aria-invalid={validation.errors.some((error) => error.startsWith("Bandwidth"))}
                    onChange={(event) => update("bandwidth", Number(event.target.value))}
                  />
                </label>

                <label className={labelClass}>
                  Monthly Budget (USD)
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    max="10000"
                    step="1"
                    value={workload.budget}
                    aria-invalid={validation.errors.some((error) => error.startsWith("Monthly budget"))}
                    onChange={(event) => update("budget", Number(event.target.value))}
                  />
                </label>

                <label className={labelClass}>
                  Storage Type
                  <select className={`${inputClass} font-sans`} value={workload.storageType} onChange={(event) => update("storageType", event.target.value as Workload["storageType"])}><option value="any">Any</option><option value="SSD">SSD</option><option value="NVMe">NVMe required</option></select>
                </label>

                <label className={labelClass}>
                  CPU Architecture
                  <select className={`${inputClass} font-sans`} value={workload.architecture} onChange={(event) => update("architecture", event.target.value as Workload["architecture"])}><option value="any">Any</option><option value="x86_64">x86_64</option><option value="arm64">ARM64</option></select>
                </label>

                <label className={labelClass}>
                  Minimum SLA (%)
                  <input className={inputClass} type="number" min="0" max="100" step="0.01" value={workload.minimumSla} onChange={(event) => update("minimumSla", Number(event.target.value))} />
                </label>

                <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                  {[["docker", "Runs with Docker", workload.docker], ["redis", "Redis / cache", workload.redis], ["backupRequired", "Provider backup required", workload.backupRequired], ["ipv4Required", "IPv4 required", workload.ipv4Required], ["highAvailability", "High availability (2 nodes)", workload.highAvailability]].map(([key, label, checked]) => <label key={String(key)} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3.5 text-sm font-medium text-slate-200"><input type="checkbox" checked={Boolean(checked)} onChange={(event) => update(key as keyof Workload, event.target.checked as never)} className="size-4 accent-[var(--color-brand)]" />{String(label)}</label>)}
                </div>
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
              <h2 className="text-xl font-bold text-white">Recommended VPS Configuration</h2>
            </div>
          </div>

          <div className="grid gap-4 py-6 sm:grid-cols-2">
            {([['Minimum', result.minimum], ['Recommended', result.recommended]] as const).map(([label, configuration]) => <div key={`${resultVersion}-${label}`} className="result-in rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-white">{label}</h3>{label === 'Recommended' && <Badge variant="mint">Preferred</Badge>}</div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-500">Compute</dt><dd className="font-bold text-white">{configuration.cpu} vCPU</dd></div><div><dt className="text-xs text-slate-500">Memory</dt><dd className="font-bold text-white">{configuration.ram} GB</dd></div><div><dt className="text-xs text-slate-500">Storage</dt><dd className="font-bold text-white">{configuration.storage} GB {configuration.storageType}</dd></div><div><dt className="text-xs text-slate-500">Transfer</dt><dd className="font-bold text-white">{configuration.bandwidth} TB</dd></div><div><dt className="text-xs text-slate-500">Network</dt><dd className="font-bold text-white">{configuration.networkSpeedMbps} Mbps</dd></div><div><dt className="text-xs text-slate-500">Nodes</dt><dd className="font-bold text-white">{configuration.nodes}</dd></div></dl></div>)}
            {isCalculating && <span className="sr-only">Calculating recommendation…</span>}
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

          <div className="mt-auto grid gap-3 border-t border-[var(--color-border)] pt-5 sm:grid-cols-3">
            <Button type="button" className="flex-1" onClick={reset}>Reset</Button>
            <Button type="button" variant="mint" className="flex-1" onClick={copyResult} disabled={isCalculating}>
              {copyState === "copied" ? "Copied result ✓" : copyState === "error" ? "Copy failed" : "Copy result & link"}
            </Button>
            <Button type="button" variant="azure" className="flex-1" onClick={savePermanentResult} disabled={isCalculating || saveState === "saving"}>
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "error" ? "Save failed" : "Save permalink"}
            </Button>
          </div>
          {savedUrl && <a href={savedUrl} className="mt-3 block text-center text-xs text-[var(--color-brand-light)] underline underline-offset-4">Open permanent recommendation →</a>}

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
        plans={plans}
        workload={calculatedWorkload}
      />
    </div>
  );
}
