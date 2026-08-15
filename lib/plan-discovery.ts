import type { CatalogPlan } from "./catalog-types";

export type PlanSort = "price" | "value" | "ram" | "cpu" | "updated";
export type PlanFilters = {
  query: string;
  provider: string;
  region: string;
  maxPrice: number | null;
  minCpu: number | null;
  minRam: number | null;
  minStorage: number | null;
  minTransfer: number | null;
  storageType: string;
  architecture: string;
  ipv4: boolean;
  ipv6: boolean;
  backup: boolean;
  sort: PlanSort;
};

function positiveNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parsePlanFilters(params: URLSearchParams): PlanFilters {
  const sort = params.get("sort");
  return {
    query: (params.get("q") || "").trim().slice(0, 100),
    provider: (params.get("provider") || "").trim(),
    region: (params.get("region") || "").trim(),
    maxPrice: positiveNumber(params.get("price")),
    minCpu: positiveNumber(params.get("cpu")),
    minRam: positiveNumber(params.get("ram")),
    minStorage: positiveNumber(params.get("storage")),
    minTransfer: positiveNumber(params.get("transfer")),
    storageType: params.get("storageType") === "NVMe" ? "NVMe" : params.get("storageType") === "SSD" ? "SSD" : "",
    architecture: params.get("architecture") === "arm64" ? "arm64" : params.get("architecture") === "x86_64" ? "x86_64" : "",
    ipv4: params.get("ipv4") === "1",
    ipv6: params.get("ipv6") === "1",
    backup: params.get("backup") === "1",
    sort: sort === "value" || sort === "ram" || sort === "cpu" || sort === "updated" ? sort : "price",
  };
}

export function planValue(plan: CatalogPlan) {
  return (plan.cpu * 2 + plan.ram + plan.storage / 20 + (plan.transferTb ?? 25) / 2) / Math.max(plan.priceMonthly, 1);
}

export function filterAndSortPlans(plans: CatalogPlan[], filters: PlanFilters) {
  const query = filters.query.toLocaleLowerCase();
  const filtered = plans.filter((plan) => {
    const searchable = `${plan.providerName} ${plan.name} ${plan.note}`.toLocaleLowerCase();
    return (!query || searchable.includes(query))
      && (!filters.provider || plan.providerSlug === filters.provider)
      && (!filters.region || plan.locations.some((location) => location.region === filters.region))
      && (filters.maxPrice === null || plan.priceMonthly <= filters.maxPrice)
      && (filters.minCpu === null || plan.cpu >= filters.minCpu)
      && (filters.minRam === null || plan.ram >= filters.minRam)
      && (filters.minStorage === null || plan.storage >= filters.minStorage)
      && (filters.minTransfer === null || plan.transferTb === null || plan.transferTb >= filters.minTransfer)
      && (!filters.storageType || plan.storageType === filters.storageType)
      && (!filters.architecture || plan.architecture === filters.architecture)
      && (!filters.ipv4 || plan.ipv4)
      && (!filters.ipv6 || plan.ipv6)
      && (!filters.backup || plan.backupAvailable);
  });
  return [...filtered].sort((a, b) => {
    if (filters.sort === "value") return planValue(b) - planValue(a);
    if (filters.sort === "ram") return b.ram - a.ram || a.priceMonthly - b.priceMonthly;
    if (filters.sort === "cpu") return b.cpu - a.cpu || a.priceMonthly - b.priceMonthly;
    if (filters.sort === "updated") return b.lastUpdated.localeCompare(a.lastUpdated);
    return a.priceMonthly - b.priceMonthly;
  });
}

export function hasActivePlanFilters(filters: PlanFilters) {
  return Boolean(filters.query || filters.provider || filters.region || filters.maxPrice !== null || filters.minCpu !== null || filters.minRam !== null || filters.minStorage !== null || filters.minTransfer !== null || filters.storageType || filters.architecture || filters.ipv4 || filters.ipv6 || filters.backup || filters.sort !== "price");
}

