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
  type ServerEstimate,
  type Workload,
} from "@/lib/selector";
import { Badge, Button, Card } from "@/components/ui";
import { ProviderRecommendations } from "@/components/provider-recommendations";
import type { CatalogPlan } from "@/lib/catalog-types";
import { trackEvent } from "@/lib/client-analytics";

const inputClass =
  "mt-2 w-full cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none transition duration-200 hover:border-[var(--color-border-strong)] focus:border-[var(--color-brand-border)] focus:ring-2 focus:ring-[var(--color-brand-soft)] aria-[invalid=true]:border-[var(--color-danger-border)]";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

const breakdownLabels = {
  application: "Application & traffic",
  database: "Database",
  redis: "Redis / cache",
  workers: "Workers & cron jobs",
  containers: "Container allocation",
  overhead: "OS & deployment overhead",
};

const quickExamples = WORKLOAD_PRESETS;

function sameWorkload(left: Workload, right: Workload) {
  return workloadToSearchParams(left).toString() === workloadToSearchParams(right).toString();
}

function FieldError({ messages }: { messages: string[] }) {
  if (!messages.length) return null;
  return <span className="mt-1.5 block text-xs font-normal normal-case tracking-normal text-[var(--color-danger-text)]">{messages[0]}</span>;
}

export function VpsSelector({ plans }: { plans: CatalogPlan[] }) {
  const [workload, setWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [calculatedWorkload, setCalculatedWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [result, setResult] = useState<ServerEstimate | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetId | null>(null);
  const [resultVersion, setResultVersion] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedUrl, setSavedUrl] = useState("");
  const started = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const validation = validateWorkload(workload);
  const isDirty = hasCalculated && !sameWorkload(workload, calculatedWorkload);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hydrationTimer = window.setTimeout(() => {
      const hasSharedCalculation = params.has("app") || params.has("runtime") || params.has("containers");
      if (hasSharedCalculation) {
        const sharedWorkload = workloadFromSearchParams(params);
        setWorkload(sharedWorkload);
        setCalculatedWorkload(sharedWorkload);
        setResult(estimateServer(sharedWorkload));
        setHasCalculated(true);
        const matchingPreset = WORKLOAD_PRESETS.find((item) => sameWorkload(item.workload, sharedWorkload));
        setSelectedPreset(matchingPreset?.id ?? null);
      }
      if (params.get("source") === "guide") trackEvent("guide_to_selector", { source: "guide" });
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const resetActionState = () => {
    setCopyState("idle");
    setSaveState("idle");
    setSavedUrl("");
  };

  const update = <K extends keyof Workload>(key: K, value: Workload[K]) => {
    if (!started.current) {
      started.current = true;
      trackEvent("selector_started", { firstField: key });
    }
    setWorkload((current) => ({ ...current, [key]: value }));
    setSelectedPreset(null);
    resetActionState();
  };

  const updateApplication = (application: Workload["application"]) => {
    const runtimeByApplication: Record<Workload["application"], Workload["runtime"]> = {
      nextjs: "nodejs",
      docker: "nodejs",
      wordpress: "php",
      n8n: "nodejs",
      game: "java",
    };
    const storageByApplication: Record<Workload["application"], number> = { nextjs: 40, docker: 40, wordpress: 30, n8n: 40, game: 80 };
    update("application", application);
    setWorkload((current) => ({
      ...current,
      application,
      runtime: runtimeByApplication[application],
      docker: application === "docker",
      containers: application === "docker" ? Math.max(current.containers, 3) : 1,
      databaseType: current.database ? (application === "wordpress" ? "mysql" : "postgresql") : "none",
      storage: storageByApplication[application],
      uploadsStorage: application === "wordpress" ? 20 : 0,
      workers: application === "n8n" ? 6 : application === "game" ? 0 : 1,
      cronJobs: application === "n8n" ? 10 : 0,
      priority: application === "game" ? "performance" : current.environment === "development" ? "economy" : "balanced",
    }));
  };

  const updateEnvironment = (environment: Workload["environment"]) => {
    update("environment", environment);
    setWorkload((current) => ({
      ...current,
      environment,
      priority: current.application === "game" ? "performance" : environment === "development" ? "economy" : "balanced",
    }));
  };

  const updateTraffic = (traffic: Workload["traffic"]) => {
    const assumptions: Record<Workload["traffic"], Pick<Workload, "requestsPerMinute" | "databaseLoad" | "bandwidth">> = {
      starter: { requestsPerMinute: 100, databaseLoad: "light", bandwidth: 1 },
      growing: { requestsPerMinute: 1500, databaseLoad: "moderate", bandwidth: 3 },
      busy: { requestsPerMinute: 5000, databaseLoad: "heavy", bandwidth: 5 },
    };
    update("traffic", traffic);
    setWorkload((current) => ({ ...current, traffic, ...assumptions[traffic] }));
  };

  const updateDatabase = (enabled: boolean) => {
    if (!started.current) {
      started.current = true;
      trackEvent("selector_started", { firstField: "database" });
    }
    setWorkload((current) => ({
      ...current,
      database: enabled,
      databaseType: enabled ? (current.application === "wordpress" ? "mysql" : "postgresql") : "none",
      databaseSize: enabled ? Math.max(current.databaseSize, 10) : 0,
    }));
    setSelectedPreset(null);
    resetActionState();
  };

  const updatePlanFilter = <K extends keyof Workload>(key: K, value: Workload[K]) => {
    const nextWorkload = { ...workload, [key]: value };
    setWorkload(nextWorkload);
    resetActionState();
    if (hasCalculated) {
      const nextCalculated = { ...calculatedWorkload, [key]: value };
      setCalculatedWorkload(nextCalculated);
      setResult(estimateServer(nextCalculated));
      setResultVersion((current) => current + 1);
      syncUrl(nextCalculated);
    }
  };

  const syncUrl = (value: Workload) => {
    const query = workloadToSearchParams(value).toString();
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  };

  const revealResult = () => {
    window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      resultHeadingRef.current?.focus({ preventScroll: true });
    });
  };

  const calculate = (value: Workload, shouldReveal = true) => {
    const nextResult = estimateServer(value);
    setResult(nextResult);
    setCalculatedWorkload({ ...value });
    setHasCalculated(true);
    setResultVersion((current) => current + 1);
    resetActionState();
    syncUrl(value);
    trackEvent("selector_completed", {
      application: value.application,
      region: value.region,
      budget: value.budget,
      bandwidth: value.bandwidth,
    });
    if (shouldReveal) revealResult();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validation.errors.length > 0) return;
    calculate(workload);
  };

  const applyPreset = (id: PresetId) => {
    const nextPreset = WORKLOAD_PRESETS.find((item) => item.id === id);
    if (!nextPreset) return;
    if (!started.current) {
      started.current = true;
      trackEvent("selector_started", { firstField: "preset", preset: id });
    }
    const nextWorkload = { ...nextPreset.workload };
    setWorkload(nextWorkload);
    setSelectedPreset(id);
    calculate(nextWorkload);
  };

  const selectExample = (value: string) => {
    applyPreset(value as PresetId);
  };

  const reset = () => {
    setWorkload({ ...DEFAULT_WORKLOAD });
    setCalculatedWorkload({ ...DEFAULT_WORKLOAD });
    setResult(null);
    setHasCalculated(false);
    setSelectedPreset(null);
    setResultVersion((current) => current + 1);
    resetActionState();
    started.current = false;
    window.history.replaceState(null, "", window.location.pathname);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyResult = async () => {
    if (!result) return;
    syncUrl(calculatedWorkload);
    const summary = [
      "Neroviax VPS estimate",
      `Recommended: ${result.recommended.cpu} vCPU · ${result.recommended.ram} GB RAM · ${result.recommended.storage} GB ${result.recommended.storageType} · ${result.recommended.bandwidth} TB transfer`,
      `Minimum: ${result.minimum.cpu} vCPU · ${result.minimum.ram} GB RAM · ${result.minimum.storage} GB storage`,
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
    if (!result) return;
    setSaveState("saving");
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: workloadToSearchParams(calculatedWorkload).toString() }),
      });
      if (!response.ok) throw new Error("Save failed");
      const payload = await response.json() as { url: string };
      setSavedUrl(payload.url);
      setSaveState("saved");
      trackEvent("recommendation_saved", { formulaVersion: result.formulaVersion });
    } catch {
      setSaveState("error");
    }
  };

  const errorsFor = (label: string) => validation.errors.filter((error) => error.startsWith(label));
  const headroom = calculatedWorkload.priority === "economy" ? 10 : calculatedWorkload.priority === "balanced" ? 25 : 50;

  return (
    <div className="space-y-12 pb-20 lg:pb-0">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <form id="vps-sizing-form" ref={formRef} onSubmit={handleSubmit} noValidate>
          <Card className="w-full p-[clamp(18px,4vw,28px)]">
            <section aria-labelledby="workload-title">
              <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge variant="azure">Quick estimate</Badge>
                  <h2 id="workload-title" className="mt-3 text-xl font-bold text-white">Size your workload</h2>
                </div>
                <label className={`${labelClass} w-full sm:max-w-52`}>
                  Use an example
                  <select className={`${inputClass} font-sans`} value={quickExamples.some((item) => item.id === selectedPreset) ? selectedPreset ?? "" : ""} onChange={(event) => selectExample(event.target.value)}>
                    <option value="" disabled hidden aria-label="No example selected" />
                    {quickExamples.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Application
                  <select className={`${inputClass} font-sans`} value={workload.application} onChange={(event) => updateApplication(event.target.value as Workload["application"])}>
                    <option value="nextjs">Next.js app</option>
                    <option value="docker">Docker Compose stack</option>
                    <option value="wordpress">WordPress + PHP</option>
                    <option value="n8n">n8n automation</option>
                    <option value="game">Game server</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Environment
                  <select className={`${inputClass} font-sans`} value={workload.environment} onChange={(event) => updateEnvironment(event.target.value as Workload["environment"])}>
                    <option value="development">Development</option>
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Monthly traffic
                  <select className={`${inputClass} font-sans`} value={workload.traffic} onChange={(event) => updateTraffic(event.target.value as Workload["traffic"])}>
                    <option value="starter">Up to 10k visits</option>
                    <option value="growing">10k–100k visits</option>
                    <option value="busy">100k+ or spiky traffic</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Database
                  <select className={`${inputClass} font-sans`} value={workload.databaseType === "none" ? "no" : "yes"} onChange={(event) => updateDatabase(event.target.value === "yes")}>
                    <option value="no">No local database</option>
                    <option value="yes">Uses a local database</option>
                  </select>
                </label>

                {workload.databaseType !== "none" && (
                  <label className={labelClass}>
                    Database data (GB)
                    <input className={inputClass} type="number" inputMode="decimal" min="0" max="10000" step="5" value={workload.databaseSize} aria-invalid={errorsFor("Database size").length > 0} onChange={(event) => update("databaseSize", Number(event.target.value))} />
                    <FieldError messages={errorsFor("Database size")} />
                  </label>
                )}
              </div>

              <details className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <summary className="cursor-pointer text-sm font-bold text-white">Fine-tune assumptions <span className="font-normal text-slate-500">(optional)</span></summary>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className={labelClass}>
                    App & system storage (GB)
                    <input className={inputClass} type="number" inputMode="decimal" min="20" max="4000" step="10" value={workload.storage} aria-invalid={errorsFor("Storage").length > 0} onChange={(event) => update("storage", Number(event.target.value))} />
                    <FieldError messages={errorsFor("Storage")} />
                  </label>
                  {workload.application === "docker" && (
                    <label className={labelClass}>
                      Total containers
                      <input className={inputClass} type="number" inputMode="numeric" min="1" max="100" value={workload.containers} aria-invalid={errorsFor("Containers").length > 0} onChange={(event) => update("containers", Number(event.target.value))} />
                      <FieldError messages={errorsFor("Containers")} />
                    </label>
                  )}
                  <label className={labelClass}>
                    Background workers
                    <input className={inputClass} type="number" inputMode="numeric" min="0" max="100" value={workload.workers} aria-invalid={errorsFor("Workers").length > 0} onChange={(event) => update("workers", Number(event.target.value))} />
                    <FieldError messages={errorsFor("Workers")} />
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] p-3.5 text-sm font-medium text-slate-200">
                    <input type="checkbox" checked={workload.redis} onChange={(event) => update("redis", event.target.checked)} className="size-5 accent-[var(--color-brand)]" />Redis / cache
                  </label>
                </div>
              </details>
            </section>

            {validation.warnings.length > 0 && (
              <div className="mt-6 space-y-2" aria-live="polite">
                {validation.warnings.map((warning) => <p key={warning} className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-4 py-3 text-xs text-[var(--color-warning-text)]">{warning}</p>)}
              </div>
            )}

            <Button type="submit" variant="azure" size="large" className="mt-7 hidden w-full lg:inline-flex" disabled={validation.errors.length > 0}>
              {isDirty ? "Recalculate VPS →" : hasCalculated ? "Calculate again →" : "Calculate VPS starting point →"}
            </Button>
          </Card>
        </form>

        <section ref={resultRef} className="scroll-mt-24 lg:sticky lg:top-24" aria-live="polite">
          {!hasCalculated || !result ? (
            <Card className="grid min-h-[430px] place-items-center p-8 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-soft)] text-2xl text-[var(--color-brand-light)]" aria-hidden="true">⌁</span>
                <Badge className="mt-5" variant="azure">Your estimate</Badge>
                <h2 ref={resultHeadingRef} tabIndex={-1} className="mt-4 text-2xl font-bold text-white outline-none">Tell us about your workload</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">Complete the essentials or choose a preset. Your recommended configuration will appear here.</p>
              </div>
            </Card>
          ) : (
            <Card className="relative overflow-hidden p-[clamp(18px,4vw,28px)]">
              {isDirty && (
                <div className="relative z-10 mb-5 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-4">
                  <p className="font-bold text-[var(--color-warning-text)]">Your inputs have changed</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-warning-text)] opacity-80">This result is based on the previous values. Recalculate before choosing a plan.</p>
                  <Button type="submit" form="vps-sizing-form" variant="azure" className="mt-3 w-full" disabled={validation.errors.length > 0}>Recalculate now →</Button>
                </div>
              )}

              <div className={`transition-opacity ${isDirty ? "pointer-events-none opacity-35" : "opacity-100"}`}>
                <div className="border-b border-[var(--color-border)] pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge variant="mint">Recommended</Badge>
                    <button type="button" onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="text-xs font-semibold text-[var(--color-brand-light)] hover:text-white">Edit inputs</button>
                  </div>
                  <h2 ref={resultHeadingRef} tabIndex={-1} className="mt-4 text-2xl font-extrabold text-white outline-none">Recommended VPS configuration</h2>
                </div>

                <div key={`${resultVersion}-recommended`} className="result-in py-6">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                    <div><p className="text-xs text-slate-500">Compute</p><p className="mt-1 text-xl font-extrabold text-white">{result.recommended.cpu} vCPU</p></div>
                    <div><p className="text-xs text-slate-500">Memory</p><p className="mt-1 text-xl font-extrabold text-white">{result.recommended.ram} GB</p></div>
                    <div><p className="text-xs text-slate-500">Storage</p><p className="mt-1 text-xl font-extrabold text-white">{result.recommended.storage} GB</p><p className="text-xs text-slate-400">{result.recommended.storageType}</p></div>
                    <div><p className="text-xs text-slate-500">Transfer</p><p className="mt-1 text-xl font-extrabold text-white">{result.recommended.bandwidth} TB</p></div>
                  </div>
                  <p className="mt-5 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] p-4 text-sm leading-relaxed text-[var(--color-success-text)]">
                    Sized for {calculatedWorkload.environment} with approximately {headroom}% {calculatedWorkload.priority} headroom above the estimated workload.
                  </p>
                </div>

                <details className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <summary className="cursor-pointer text-sm font-bold text-white">Cheapest viable configuration</summary>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-xs text-slate-500">Compute</dt><dd className="font-bold text-white">{result.minimum.cpu} vCPU</dd></div>
                    <div><dt className="text-xs text-slate-500">Memory</dt><dd className="font-bold text-white">{result.minimum.ram} GB</dd></div>
                    <div><dt className="text-xs text-slate-500">Storage</dt><dd className="font-bold text-white">{result.minimum.storage} GB {result.minimum.storageType}</dd></div>
                    <div><dt className="text-xs text-slate-500">Transfer</dt><dd className="font-bold text-white">{result.minimum.bandwidth} TB</dd></div>
                  </dl>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">Meets the estimated baseline with less room for traffic spikes, deployments or recovery work.</p>
                </details>

                <details className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <summary className="cursor-pointer text-sm font-bold text-white">How we calculated this</summary>
                  <p className="mt-3 text-xs text-slate-400">{result.rawRam} GB estimated RAM before rounding to a {result.ram} GB VPS tier.</p>
                  <dl className="mt-4 space-y-2.5">
                    {(Object.keys(breakdownLabels) as Array<keyof typeof breakdownLabels>).map((key) => (
                      <div key={key} className="flex items-center justify-between gap-4 text-sm"><dt className="text-slate-400">{breakdownLabels[key]}</dt><dd className="font-semibold text-slate-100">{result.breakdown[key]} GB</dd></div>
                    ))}
                  </dl>
                  <ul className="mt-5 space-y-2 border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed text-slate-400">
                    {result.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
                  </ul>
                </details>

                {result.warnings.length > 0 && (
                  <div className="mt-3 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-4">
                    <h3 className="text-sm font-bold text-[var(--color-warning-text)]">Capacity notes</h3>
                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--color-warning-text)] opacity-80">{result.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul>
                  </div>
                )}

                <Button type="button" variant="azure" size="large" className="mt-5 w-full" onClick={() => plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>View matching VPS plans →</Button>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button type="button" variant="default" onClick={copyResult}>{copyState === "copied" ? "Copied ✓" : copyState === "error" ? "Copy failed" : "Copy & share"}</Button>
                  <Button type="button" variant="default" onClick={savePermanentResult} disabled={saveState === "saving"}>{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "error" ? "Save failed" : "Save permalink"}</Button>
                </div>
                {savedUrl && <a href={savedUrl} className="mt-3 block text-center text-xs text-[var(--color-brand-light)] underline underline-offset-4">Open permanent recommendation →</a>}
                <button type="button" onClick={reset} className="mx-auto mt-4 block text-xs text-slate-500 underline underline-offset-4 hover:text-white">Reset calculator</button>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">Baseline estimate only. Verify CPU, memory and disk metrics with production monitoring after deployment.</p>
              </div>
            </Card>
          )}
        </section>
      </div>

      <div ref={plansRef} className="scroll-mt-24">
        {hasCalculated && result && !isDirty && (
          <section aria-labelledby="plan-filters-title">
            <Card className="mb-8 p-[clamp(18px,4vw,28px)]">
              <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge variant="azure">Find a plan</Badge>
                  <h2 id="plan-filters-title" className="mt-3 text-xl font-bold text-white">Where should we look?</h2>
                </div>
                <p className="text-xs text-slate-500">Filters update matches instantly</p>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Region
                  <select className={`${inputClass} font-sans`} value={workload.region} onChange={(event) => updatePlanFilter("region", event.target.value as Workload["region"])}>
                    <option value="any">Any region</option><option value="europe">Europe</option><option value="north-america">North America</option><option value="asia-pacific">Asia Pacific</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Maximum monthly price (USD)
                  <input className={inputClass} type="number" inputMode="decimal" min="1" max="10000" step="1" value={workload.budget} aria-invalid={errorsFor("Monthly budget").length > 0} onChange={(event) => updatePlanFilter("budget", Number(event.target.value))} />
                  <FieldError messages={errorsFor("Monthly budget")} />
                </label>
              </div>
              <details className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <summary className="cursor-pointer text-sm font-bold text-white">More plan filters <span className="font-normal text-slate-500">(optional)</span></summary>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className={labelClass}>
                    Monthly transfer (TB)
                    <input className={inputClass} type="number" inputMode="decimal" min="0.1" max="100" step="0.1" value={workload.bandwidth} aria-invalid={errorsFor("Bandwidth").length > 0} onChange={(event) => updatePlanFilter("bandwidth", Number(event.target.value))} />
                    <FieldError messages={errorsFor("Bandwidth")} />
                  </label>
                  <label className={labelClass}>
                    Storage type
                    <select className={`${inputClass} font-sans`} value={workload.storageType} onChange={(event) => updatePlanFilter("storageType", event.target.value as Workload["storageType"])}><option value="any">Any</option><option value="SSD">SSD</option><option value="NVMe">NVMe required</option></select>
                  </label>
                  <label className={labelClass}>
                    CPU architecture
                    <select className={`${inputClass} font-sans`} value={workload.architecture} onChange={(event) => updatePlanFilter("architecture", event.target.value as Workload["architecture"])}><option value="any">Any</option><option value="x86_64">x86_64</option><option value="arm64">ARM64</option></select>
                  </label>
                  <label className={labelClass}>
                    Minimum SLA (%)
                    <input className={inputClass} type="number" inputMode="decimal" min="0" max="100" step="0.01" value={workload.minimumSla} aria-invalid={errorsFor("Minimum SLA").length > 0} onChange={(event) => updatePlanFilter("minimumSla", Number(event.target.value))} />
                    <FieldError messages={errorsFor("Minimum SLA")} />
                  </label>
                  <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
                    {([["backupRequired", "Backup required", workload.backupRequired], ["ipv4Required", "IPv4 required", workload.ipv4Required], ["highAvailability", "High availability", workload.highAvailability]] as const).map(([key, label, checked]) => (
                      <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] p-3.5 text-sm font-medium text-slate-200">
                        <input type="checkbox" checked={checked} onChange={(event) => updatePlanFilter(key, event.target.checked)} className="size-5 accent-[var(--color-brand)]" />{label}
                      </label>
                    ))}
                  </div>
                </div>
              </details>
            </Card>
            <ProviderRecommendations estimate={result} isLoading={false} resultVersion={resultVersion} plans={plans} workload={calculatedWorkload} />
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-header)] p-3 backdrop-blur lg:hidden">
        <Button type="submit" form="vps-sizing-form" variant="azure" size="large" className="w-full" disabled={validation.errors.length > 0}>
          {isDirty ? "Recalculate VPS →" : hasCalculated ? "Calculate again →" : "Calculate VPS starting point →"}
        </Button>
      </div>
    </div>
  );
}
