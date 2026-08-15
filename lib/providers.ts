import type { CatalogPlan } from "./catalog-types";
import type { ArchitecturePreference, Region, ServerConfiguration, StoragePreference } from "./selector";

export type MatchKind = "lowest-price" | "best-value" | "more-headroom";
export type ProviderPlan = CatalogPlan;
export type ResourceRequirement = { cpu: number; ram: number; storage: number; bandwidth?: number; networkSpeedMbps?: number; nodes?: number };
export type PlanMatchCriteria = {
  region: Region; bandwidth: number; budget: number; storageType?: StoragePreference;
  architecture?: ArchitecturePreference; backupRequired?: boolean; ipv4Required?: boolean; minimumSla?: number;
  snapshotRequired?: boolean;
};

export function criteriaForConfiguration(base: PlanMatchCriteria, configuration: ServerConfiguration): PlanMatchCriteria {
  return { ...base, bandwidth: configuration.bandwidth, storageType: configuration.storageType, architecture: configuration.architecture, backupRequired: configuration.backupRequired, snapshotRequired: configuration.snapshotRequired, ipv4Required: configuration.ipv4Required, minimumSla: configuration.minimumSla };
}

export type PlanMatch = {
  kind: MatchKind;
  label: string;
  reason: string;
  plan: CatalogPlan;
};

const regionLabels: Record<Exclude<Region, "any">, string> = {
  europe: "Europe",
  "north-america": "North America",
  "asia-pacific": "Asia Pacific",
};

function availableInRegion(plan: CatalogPlan, region: Region) {
  if (region === "any") return true;
  const label = regionLabels[region];
  return plan.locations.some((location) => location.region === label);
}

function fits(plan: CatalogPlan, estimate: ResourceRequirement, criteria?: PlanMatchCriteria) {
  const requiredTransfer = Math.max(estimate.bandwidth ?? 0, criteria?.bandwidth ?? 0);
  const nodes = estimate.nodes ?? 1;
  return plan.available
    && plan.cpu >= estimate.cpu
    && plan.ram >= estimate.ram
    && plan.storage >= estimate.storage
    && (!criteria || plan.priceMonthly * nodes <= criteria.budget)
    && (plan.transferTb === null || plan.transferTb >= requiredTransfer)
    && (!estimate.networkSpeedMbps || plan.networkSpeedMbps === null || plan.networkSpeedMbps >= estimate.networkSpeedMbps)
    && (!criteria || availableInRegion(plan, criteria.region))
    && (!criteria?.storageType || criteria.storageType === "any" || criteria.storageType === "SSD" || plan.storageType === "NVMe")
    && (!criteria?.architecture || criteria.architecture === "any" || plan.architecture === criteria.architecture)
    && (!criteria?.backupRequired || plan.backupAvailable)
    && (!criteria?.snapshotRequired || plan.snapshotAvailable)
    && (!criteria?.ipv4Required || plan.ipv4)
    && (!criteria?.minimumSla || (plan.slaPercent !== null && plan.slaPercent >= criteria.minimumSla));
}

function overprovisionScore(plan: CatalogPlan, estimate: ResourceRequirement) {
  return (
    plan.cpu / estimate.cpu
    + plan.ram / estimate.ram
    + plan.storage / estimate.storage
  ) / 3;
}

export function matchProviderPlans(estimate: ResourceRequirement, catalog: CatalogPlan[], criteria?: PlanMatchCriteria): PlanMatch[] {
  const eligible = catalog.filter((plan) => fits(plan, estimate, criteria));
  if (eligible.length === 0) return [];

  const nodes = estimate.nodes ?? 1;
  const firstMonthCost = (plan: CatalogPlan) => (plan.priceMonthly + plan.setupFee) * nodes;
  const cheapest = [...eligible].sort((a, b) => firstMonthCost(a) - firstMonthCost(b))[0];
  const remaining = eligible.filter((plan) => plan.slug !== cheapest.slug);
  const bestValue = [...remaining].sort((a, b) => {
    const scoreA = firstMonthCost(a) * overprovisionScore(a, estimate);
    const scoreB = firstMonthCost(b) * overprovisionScore(b, estimate);
    return scoreA - scoreB;
  })[0];
  const headroomCandidates = remaining.filter(
    (plan) => plan.cpu >= estimate.cpu * 1.5 && plan.ram >= estimate.ram * 1.5,
  );
  const moreHeadroom = [...headroomCandidates]
    .filter((plan) => plan.slug !== bestValue?.slug)
    .sort((a, b) => firstMonthCost(a) - firstMonthCost(b))[0];

  const matches: PlanMatch[] = [{
    kind: "lowest-price",
    label: "Lowest price",
    reason: `The lowest first-month cost that meets every infrastructure requirement${nodes > 1 ? ` across ${nodes} nodes` : ""}.`,
    plan: cheapest,
  }];

  if (bestValue) {
    matches.push({
      kind: "best-value",
      label: "Best value",
      reason: "More resources per dollar while still staying close to this workload tier.",
      plan: bestValue,
    });
  }

  if (moreHeadroom) {
    matches.push({
      kind: "more-headroom",
      label: "More headroom",
      reason: "At least 50% more CPU and RAM for traffic growth or deployment spikes.",
      plan: moreHeadroom,
    });
  }

  return matches.slice(0, 3);
}
