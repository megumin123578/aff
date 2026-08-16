export const RECOMMENDATION_FORMULA_VERSION = "2.1.0";

export type Application = "nextjs" | "docker" | "wordpress" | "n8n" | "game";
export type Runtime = "nodejs" | "php" | "python" | "java" | "go" | "dotnet";
export type Traffic = "starter" | "growing" | "busy";
export type Environment = "development" | "staging" | "production";
export type Priority = "economy" | "balanced" | "performance";
export type Region = "any" | "europe" | "north-america" | "asia-pacific";
export type DatabaseType = "none" | "postgresql" | "mysql" | "mongodb";
export type DatabaseLoad = "light" | "moderate" | "heavy";
export type StoragePreference = "any" | "SSD" | "NVMe";
export type ArchitecturePreference = "any" | "x86_64" | "arm64";
export type PresetId = "blog" | "saas" | "ecommerce" | "automation" | "game-server";

export type Workload = {
  application: Application;
  runtime: Runtime;
  traffic: Traffic;
  requestsPerMinute: number;
  containers: number;
  docker: boolean;
  database: boolean;
  databaseType: DatabaseType;
  databaseSize: number;
  databaseLoad: DatabaseLoad;
  redis: boolean;
  workers: number;
  cronJobs: number;
  storage: number;
  uploadsStorage: number;
  environment: Environment;
  priority: Priority;
  bandwidth: number;
  region: Region;
  budget: number;
  storageType: StoragePreference;
  architecture: ArchitecturePreference;
  backupRequired: boolean;
  ipv4Required: boolean;
  minimumSla: number;
  highAvailability: boolean;
};

export type RamBreakdown = {
  application: number;
  database: number;
  redis: number;
  workers: number;
  containers: number;
  overhead: number;
};

export type ServerConfiguration = {
  cpu: number;
  ram: number;
  storage: number;
  bandwidth: number;
  storageType: "SSD" | "NVMe";
  architecture: ArchitecturePreference;
  backupRequired: boolean;
  snapshotRequired: boolean;
  ipv4Required: boolean;
  minimumSla: number;
  networkSpeedMbps: number;
  nodes: number;
};

export type ServerEstimate = {
  formulaVersion: string;
  minimum: ServerConfiguration;
  recommended: ServerConfiguration;
  cpu: number;
  ram: number;
  storage: number;
  bandwidth: number;
  rawRam: number;
  breakdown: RamBreakdown;
  reasons: string[];
  warnings: string[];
};

export const DEFAULT_WORKLOAD: Workload = {
  application: "nextjs", runtime: "nodejs", traffic: "starter", requestsPerMinute: 100,
  containers: 1, docker: false, database: true, databaseType: "postgresql",
  databaseSize: 10, databaseLoad: "light", redis: false, workers: 1, cronJobs: 0,
  storage: 40, uploadsStorage: 0, environment: "production", priority: "balanced",
  bandwidth: 1, region: "any", budget: 25, storageType: "any", architecture: "any",
  backupRequired: false, ipv4Required: true, minimumSla: 99.9, highAvailability: false,
};

export const WORKLOAD_PRESETS: Array<{ id: PresetId; label: string; description: string; workload: Workload }> = [
  { id: "blog", label: "Blog", description: "WordPress publication", workload: { ...DEFAULT_WORKLOAD, application: "wordpress", runtime: "php", traffic: "starter", requestsPerMinute: 150, containers: 2, databaseType: "mysql", databaseSize: 5, workers: 0, storage: 30, uploadsStorage: 20, priority: "economy", budget: 15 } },
  { id: "saas", label: "SaaS", description: "App, workers and database", workload: { ...DEFAULT_WORKLOAD, traffic: "growing", requestsPerMinute: 1500, containers: 5, docker: true, databaseSize: 30, databaseLoad: "moderate", redis: true, workers: 3, storage: 50, uploadsStorage: 10, bandwidth: 3, budget: 50, backupRequired: true } },
  { id: "ecommerce", label: "E-commerce", description: "Storefront with traffic spikes", workload: { ...DEFAULT_WORKLOAD, application: "wordpress", runtime: "php", traffic: "busy", requestsPerMinute: 5000, containers: 4, databaseType: "mysql", databaseSize: 80, databaseLoad: "heavy", redis: true, workers: 4, storage: 60, uploadsStorage: 60, priority: "performance", bandwidth: 5, budget: 100, storageType: "NVMe", backupRequired: true } },
  { id: "automation", label: "Automation", description: "n8n and background jobs", workload: { ...DEFAULT_WORKLOAD, application: "n8n", traffic: "growing", requestsPerMinute: 500, containers: 4, docker: true, databaseSize: 20, databaseLoad: "moderate", redis: true, workers: 6, cronJobs: 10, storage: 40, bandwidth: 2, budget: 40, backupRequired: true } },
  { id: "game-server", label: "Game server", description: "Latency-sensitive server", workload: { ...DEFAULT_WORKLOAD, application: "game", runtime: "java", traffic: "growing", requestsPerMinute: 1000, containers: 2, database: false, databaseType: "none", databaseSize: 0, workers: 0, storage: 80, priority: "performance", bandwidth: 3, budget: 60, storageType: "NVMe", backupRequired: true } },
];

const applicationRam: Record<Application, number> = { nextjs: 1, docker: 0.8, wordpress: 1.25, n8n: 1.5, game: 2 };
const runtimeRam: Record<Runtime, number> = { nodejs: 0.3, php: 0.25, python: 0.4, java: 1.5, go: 0.15, dotnet: 0.8 };
const trafficRam: Record<Traffic, number> = { starter: 0, growing: 0.75, busy: 2 };
const environmentOverhead: Record<Environment, number> = { development: 0.5, staging: 0.75, production: 1.25 };
const priorityHeadroom: Record<Priority, number> = { economy: 1.1, balanced: 1.25, performance: 1.5 };
const databaseRam: Record<DatabaseType, number> = { none: 0, postgresql: 1.5, mysql: 1.4, mongodb: 1.8 };
const databaseLoadFactor: Record<DatabaseLoad, number> = { light: 0.8, moderate: 1.3, heavy: 2 };

function round(value: number) { return Math.round(value * 10) / 10; }
function nextTier(value: number, tiers: number[]) { return tiers.find((tier) => value <= tier) ?? tiers.at(-1)!; }
function effectiveDatabase(input: Workload): DatabaseType { return input.database ? (input.databaseType === "none" ? "postgresql" : input.databaseType) : "none"; }

export function validateWorkload(input: Workload) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ranges: Array<[number, number, number, string]> = [
    [input.storage, 20, 4000, "Storage"],
    [input.bandwidth, 0.1, 100, "Bandwidth"], [input.budget, 1, 10000, "Monthly budget"],
    [input.requestsPerMinute, 0, 1000000, "Requests per minute"], [input.databaseSize, 0, 10000, "Database size"],
    [input.uploadsStorage, 0, 10000, "Upload storage"], [input.workers, 0, 100, "Workers"],
    [input.cronJobs, 0, 1000, "Cron jobs"], [input.minimumSla, 0, 100, "Minimum SLA"],
  ];
  for (const [value, minimum, maximum, label] of ranges) if (!Number.isFinite(value) || value < minimum || value > maximum) errors.push(`${label} must be between ${minimum} and ${maximum}.`);
  if (input.docker && (!Number.isFinite(input.containers) || input.containers < 1 || input.containers > 100)) errors.push("Containers must be between 1 and 100.");
  if (input.docker && input.containers > 30) warnings.push("More than 30 containers often benefits from multiple VPS nodes or an orchestrator.");
  if (input.storage + input.databaseSize + input.uploadsStorage > 1000) warnings.push("Storage above 1 TB is often more economical with dedicated or object storage.");
  if (input.traffic === "busy" && input.priority === "economy") warnings.push("Economy mode leaves limited burst headroom for busy traffic.");
  if (input.docker && input.environment === "production" && input.containers > 20) warnings.push("A single production VPS becomes a failure domain at this container count.");
  if (input.highAvailability) warnings.push("High availability requires at least two nodes and a load balancer; listed plan cost is per node.");
  return { errors, warnings };
}

export function estimateServer(input: Workload): ServerEstimate {
  const databaseType = effectiveDatabase(input);
  const breakdown: RamBreakdown = {
    application: round(applicationRam[input.application] + runtimeRam[input.runtime] + trafficRam[input.traffic]),
    database: round(databaseRam[databaseType] * databaseLoadFactor[input.databaseLoad] + (databaseType === "none" ? 0 : Math.min(input.databaseSize / 100, 2) * 0.2)),
    redis: input.redis ? (input.traffic === "busy" ? 1 : 0.5) : 0,
    workers: round(input.workers * 0.3 + input.cronJobs * 0.03),
    containers: input.docker ? round(Math.max(0, input.containers - 1) * 0.2) : 0,
    overhead: round(environmentOverhead[input.environment] + (input.highAvailability ? 0.5 : 0)),
  };
  const rawRam = round(Object.values(breakdown).reduce((sum, value) => sum + value, 0));
  const minimumRam = nextTier(Math.max(2, rawRam * 0.85), [2, 4, 8, 16, 32, 64, 128]);
  const recommendedRam = nextTier(Math.max(minimumRam, rawRam * priorityHeadroom[input.priority]), [2, 4, 8, 16, 32, 64, 128]);
  const cpuBase = minimumRam <= 2 ? 1 : minimumRam <= 4 ? 2 : minimumRam <= 8 ? 4 : minimumRam <= 16 ? 6 : minimumRam <= 32 ? 8 : 16;
  const cpuDemand = cpuBase + Math.floor(input.workers / 4) + (input.application === "game" ? 1 : 0);
  const minimumCpu = nextTier(cpuDemand, [1, 2, 4, 6, 8, 12, 16, 24, 32]);
  const recommendedCpu = nextTier(cpuDemand * (input.priority === "performance" ? 1.5 : 1.25), [1, 2, 4, 6, 8, 12, 16, 24, 32]);
  const requiredStorage = Math.max(20, input.storage + input.databaseSize + input.uploadsStorage);
  const minimumStorage = Math.ceil(requiredStorage / 10) * 10;
  const recommendedStorage = Math.ceil(requiredStorage * (input.priority === "performance" ? 1.35 : 1.2) / 10) * 10;
  const minimumStorageType = input.storageType === "any" ? "SSD" : input.storageType;
  const recommendedStorageType = input.storageType === "NVMe" || databaseType !== "none" ? "NVMe" : minimumStorageType;
  const nodes = input.highAvailability ? 2 : 1;
  const minimum: ServerConfiguration = { cpu: minimumCpu, ram: minimumRam, storage: minimumStorage, bandwidth: input.bandwidth, storageType: minimumStorageType, architecture: input.architecture, backupRequired: input.backupRequired, snapshotRequired: false, ipv4Required: input.ipv4Required, minimumSla: input.minimumSla, networkSpeedMbps: input.bandwidth >= 10 ? 2000 : 1000, nodes };
  const recommended: ServerConfiguration = { cpu: recommendedCpu, ram: recommendedRam, storage: recommendedStorage, bandwidth: Math.ceil(input.bandwidth * 1.25 * 10) / 10, storageType: recommendedStorageType, architecture: input.architecture, backupRequired: input.backupRequired || (input.environment === "production" && databaseType !== "none"), snapshotRequired: input.environment === "production", ipv4Required: input.ipv4Required, minimumSla: input.minimumSla, networkSpeedMbps: input.bandwidth >= 5 ? 2000 : 1000, nodes };
  const validation = validateWorkload(input);
  const warnings = [...validation.warnings];
  if (recommendedRam >= 64) warnings.push("This workload is approaching dedicated-server territory.");
  const trafficDescription: Record<Traffic, string> = { starter: "up to 10k monthly visits", growing: "10k–100k monthly visits", busy: "100k+ or spiky monthly traffic" };
  const reasons = [
    `${input.application} on ${input.runtime} is sized for ${trafficDescription[input.traffic]}.`,
    databaseType === "none" ? "No local database memory or storage was reserved." : `${databaseType} ${input.databaseLoad} load includes ${input.databaseSize} GB of database storage.`,
    `${input.workers} workers, ${input.cronJobs} cron jobs${input.redis ? " and Redis cache" : ""} are included.`,
    `${input.environment} overhead plus ${input.priority} deployment headroom separates minimum from recommended capacity.`,
    `${input.bandwidth} TB transfer, ${input.region.replaceAll("-", " ")} region and $${input.budget}/month are applied during plan matching.`,
  ];
  return { formulaVersion: RECOMMENDATION_FORMULA_VERSION, minimum, recommended, cpu: recommended.cpu, ram: recommended.ram, storage: recommended.storage, bandwidth: recommended.bandwidth, rawRam, breakdown, reasons, warnings };
}

const applications: Application[] = ["nextjs", "docker", "wordpress", "n8n", "game"];
const runtimes: Runtime[] = ["nodejs", "php", "python", "java", "go", "dotnet"];
const trafficLevels: Traffic[] = ["starter", "growing", "busy"];
const environments: Environment[] = ["development", "staging", "production"];
const priorities: Priority[] = ["economy", "balanced", "performance"];
const regions: Region[] = ["any", "europe", "north-america", "asia-pacific"];
const databaseTypes: DatabaseType[] = ["none", "postgresql", "mysql", "mongodb"];
const databaseLoads: DatabaseLoad[] = ["light", "moderate", "heavy"];
const storageTypes: StoragePreference[] = ["any", "SSD", "NVMe"];
const architectures: ArchitecturePreference[] = ["any", "x86_64", "arm64"];

function validChoice<T extends string>(value: string | null, choices: T[], fallback: T): T { return value && choices.includes(value as T) ? value as T : fallback; }
function validNumber(value: string | null, fallback: number, min: number, max: number) { const parsed = Number(value); return value !== null && Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback; }
function boolParam(params: URLSearchParams, key: string, fallback: boolean) { return params.get(key) === null ? fallback : params.get(key) === "1"; }

export function workloadFromSearchParams(params: URLSearchParams): Workload {
  const legacyDatabase = boolParam(params, "database", DEFAULT_WORKLOAD.database);
  const databaseType = validChoice(params.get("dbType"), databaseTypes, legacyDatabase ? DEFAULT_WORKLOAD.databaseType : "none");
  return {
    application: validChoice(params.get("app"), applications, DEFAULT_WORKLOAD.application),
    runtime: validChoice(params.get("runtime"), runtimes, DEFAULT_WORKLOAD.runtime),
    traffic: validChoice(params.get("traffic"), trafficLevels, DEFAULT_WORKLOAD.traffic),
    requestsPerMinute: validNumber(params.get("rpm"), DEFAULT_WORKLOAD.requestsPerMinute, 0, 1000000),
    containers: validNumber(params.get("containers"), DEFAULT_WORKLOAD.containers, 1, 100), docker: boolParam(params, "docker", DEFAULT_WORKLOAD.docker),
    database: databaseType !== "none", databaseType,
    databaseSize: validNumber(params.get("dbSize"), databaseType === "none" ? 0 : DEFAULT_WORKLOAD.databaseSize, 0, 10000),
    databaseLoad: validChoice(params.get("dbLoad"), databaseLoads, DEFAULT_WORKLOAD.databaseLoad), redis: boolParam(params, "redis", DEFAULT_WORKLOAD.redis),
    workers: validNumber(params.get("workers"), DEFAULT_WORKLOAD.workers, 0, 100), cronJobs: validNumber(params.get("cron"), DEFAULT_WORKLOAD.cronJobs, 0, 1000),
    storage: validNumber(params.get("storage"), DEFAULT_WORKLOAD.storage, 20, 4000), uploadsStorage: validNumber(params.get("uploads"), DEFAULT_WORKLOAD.uploadsStorage, 0, 10000),
    environment: validChoice(params.get("environment"), environments, DEFAULT_WORKLOAD.environment), priority: validChoice(params.get("priority"), priorities, DEFAULT_WORKLOAD.priority),
    bandwidth: validNumber(params.get("bandwidth"), DEFAULT_WORKLOAD.bandwidth, 0.1, 100), region: validChoice(params.get("region"), regions, DEFAULT_WORKLOAD.region), budget: validNumber(params.get("budget"), DEFAULT_WORKLOAD.budget, 1, 10000),
    storageType: validChoice(params.get("storageType"), storageTypes, DEFAULT_WORKLOAD.storageType), architecture: validChoice(params.get("architecture"), architectures, DEFAULT_WORKLOAD.architecture),
    backupRequired: boolParam(params, "backup", DEFAULT_WORKLOAD.backupRequired), ipv4Required: boolParam(params, "ipv4", DEFAULT_WORKLOAD.ipv4Required),
    minimumSla: validNumber(params.get("sla"), DEFAULT_WORKLOAD.minimumSla, 0, 100), highAvailability: boolParam(params, "ha", DEFAULT_WORKLOAD.highAvailability),
  };
}

export function workloadToSearchParams(input: Workload) {
  return new URLSearchParams({
    app: input.application, runtime: input.runtime, traffic: input.traffic, rpm: String(input.requestsPerMinute),
    containers: String(input.containers), docker: input.docker ? "1" : "0", database: input.database ? "1" : "0", dbType: input.databaseType,
    dbSize: String(input.databaseSize), dbLoad: input.databaseLoad, redis: input.redis ? "1" : "0", workers: String(input.workers), cron: String(input.cronJobs),
    storage: String(input.storage), uploads: String(input.uploadsStorage), environment: input.environment, priority: input.priority,
    bandwidth: String(input.bandwidth), region: input.region, budget: String(input.budget), storageType: input.storageType, architecture: input.architecture,
    backup: input.backupRequired ? "1" : "0", ipv4: input.ipv4Required ? "1" : "0", sla: String(input.minimumSla), ha: input.highAvailability ? "1" : "0",
  });
}
