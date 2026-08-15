export type Application = "nextjs" | "docker" | "wordpress" | "n8n" | "game";
export type Traffic = "starter" | "growing" | "busy";
export type Environment = "development" | "staging" | "production";
export type Priority = "economy" | "balanced" | "performance";
export type PresetId = "blog" | "saas" | "ecommerce" | "automation" | "game-server";

export type Workload = {
  application: Application;
  traffic: Traffic;
  containers: number;
  database: boolean;
  storage: number;
  environment: Environment;
  priority: Priority;
};

export type RamBreakdown = {
  application: number;
  database: number;
  containers: number;
  overhead: number;
};

export type ServerEstimate = {
  ram: number;
  cpu: number;
  storage: number;
  rawRam: number;
  breakdown: RamBreakdown;
  reasons: string[];
  warnings: string[];
};

export const DEFAULT_WORKLOAD: Workload = {
  application: "nextjs",
  traffic: "starter",
  containers: 3,
  database: true,
  storage: 40,
  environment: "production",
  priority: "balanced",
};

export const WORKLOAD_PRESETS: Array<{
  id: PresetId;
  label: string;
  description: string;
  workload: Workload;
}> = [
  {
    id: "blog",
    label: "Blog",
    description: "WordPress publication",
    workload: { application: "wordpress", traffic: "starter", containers: 2, database: true, storage: 40, environment: "production", priority: "economy" },
  },
  {
    id: "saas",
    label: "SaaS",
    description: "App, workers and database",
    workload: { application: "nextjs", traffic: "growing", containers: 5, database: true, storage: 80, environment: "production", priority: "balanced" },
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Storefront with traffic spikes",
    workload: { application: "wordpress", traffic: "busy", containers: 4, database: true, storage: 120, environment: "production", priority: "performance" },
  },
  {
    id: "automation",
    label: "Automation",
    description: "n8n and background jobs",
    workload: { application: "n8n", traffic: "growing", containers: 4, database: true, storage: 60, environment: "production", priority: "balanced" },
  },
  {
    id: "game-server",
    label: "Game server",
    description: "Latency-sensitive server",
    workload: { application: "game", traffic: "growing", containers: 2, database: false, storage: 80, environment: "production", priority: "performance" },
  },
];

const applicationRam: Record<Application, number> = {
  nextjs: 1,
  docker: 0.8,
  wordpress: 1.25,
  n8n: 1.5,
  game: 2,
};
const trafficRam: Record<Traffic, number> = { starter: 0, growing: 0.75, busy: 2 };
const environmentOverhead: Record<Environment, number> = { development: 0.5, staging: 0.75, production: 1.25 };
const priorityFactor: Record<Priority, number> = { economy: 0.9, balanced: 1, performance: 1.3 };

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function nextTier(value: number, tiers: number[]) {
  return tiers.find((tier) => value <= tier) ?? tiers.at(-1)!;
}

export function validateWorkload(input: Workload) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Number.isFinite(input.containers) || input.containers < 1 || input.containers > 100) {
    errors.push("Containers must be between 1 and 100.");
  } else if (input.containers > 30) {
    warnings.push("More than 30 containers often benefits from multiple VPS nodes or an orchestrator.");
  }

  if (!Number.isFinite(input.storage) || input.storage < 20 || input.storage > 4000) {
    errors.push("Storage must be between 20 GB and 4,000 GB.");
  } else if (input.storage > 1000) {
    warnings.push("Storage above 1 TB is often more economical on dedicated or object storage.");
  }

  if (input.traffic === "busy" && input.priority === "economy") {
    warnings.push("Economy mode leaves limited burst headroom for busy traffic.");
  }

  if (input.environment === "production" && input.containers > 20) {
    warnings.push("A single production VPS becomes a failure domain at this container count.");
  }

  return { errors, warnings };
}

export function estimateServer(input: Workload): ServerEstimate {
  const factor = priorityFactor[input.priority];
  const breakdown: RamBreakdown = {
    application: round((applicationRam[input.application] + trafficRam[input.traffic]) * factor),
    database: round((input.database ? (input.environment === "production" ? 1.5 : 1) : 0) * factor),
    containers: round(Math.max(0, input.containers - 1) * 0.25 * factor),
    overhead: round(environmentOverhead[input.environment] * factor),
  };
  const rawRam = round(Object.values(breakdown).reduce((sum, value) => sum + value, 0));
  const ram = nextTier(Math.max(2, rawRam), [2, 4, 8, 16, 32, 64]);
  const baseCpu = ram <= 2 ? 1 : ram <= 4 ? 2 : ram <= 8 ? 4 : ram <= 16 ? 6 : ram <= 32 ? 8 : 12;
  const cpuDemand = baseCpu
    + (input.traffic === "busy" ? 1 : 0)
    + (input.application === "game" ? 1 : 0)
    + (input.priority === "performance" ? 1 : 0);
  const cpu = nextTier(cpuDemand, [1, 2, 4, 6, 8, 12, 16]);
  const storageFloor = input.database ? 40 : 25;
  const storageHeadroom = input.priority === "performance" ? 1.15 : 1;
  const storage = Math.ceil(Math.max(input.storage, storageFloor) * storageHeadroom / 10) * 10;
  const validation = validateWorkload(input);
  const warnings = [...validation.warnings];

  if (rawRam > 32) {
    warnings.push("This workload is approaching dedicated-server territory.");
  }

  const reasons = [
    `${input.application} workload sized for ${input.traffic} traffic.`,
    `${input.environment} overhead and deployment headroom are included.`,
    input.database
      ? "Database memory is isolated from the application budget."
      : "No local database memory was reserved.",
    `${input.priority} priority controls the amount of resource headroom.`,
  ];

  return { ram, cpu, storage, rawRam, breakdown, reasons, warnings };
}

const applications: Application[] = ["nextjs", "docker", "wordpress", "n8n", "game"];
const trafficLevels: Traffic[] = ["starter", "growing", "busy"];
const environments: Environment[] = ["development", "staging", "production"];
const priorities: Priority[] = ["economy", "balanced", "performance"];

function validChoice<T extends string>(value: string | null, choices: T[], fallback: T): T {
  return value && choices.includes(value as T) ? (value as T) : fallback;
}

function validNumber(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return value !== null && Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

export function workloadFromSearchParams(params: URLSearchParams): Workload {
  return {
    application: validChoice(params.get("app"), applications, DEFAULT_WORKLOAD.application),
    traffic: validChoice(params.get("traffic"), trafficLevels, DEFAULT_WORKLOAD.traffic),
    containers: validNumber(params.get("containers"), DEFAULT_WORKLOAD.containers, 1, 100),
    database: params.get("database") === null ? DEFAULT_WORKLOAD.database : params.get("database") === "1",
    storage: validNumber(params.get("storage"), DEFAULT_WORKLOAD.storage, 20, 4000),
    environment: validChoice(params.get("environment"), environments, DEFAULT_WORKLOAD.environment),
    priority: validChoice(params.get("priority"), priorities, DEFAULT_WORKLOAD.priority),
  };
}

export function workloadToSearchParams(input: Workload) {
  return new URLSearchParams({
    app: input.application,
    traffic: input.traffic,
    containers: String(input.containers),
    database: input.database ? "1" : "0",
    storage: String(input.storage),
    environment: input.environment,
    priority: input.priority,
  });
}
