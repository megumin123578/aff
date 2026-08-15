import type { ServerEstimate } from "./selector";

export type ProviderId = "hetzner" | "digitalocean";
export type MatchKind = "lowest-price" | "best-value" | "more-headroom";

export const PROVIDER_AFFILIATE_IDS: Record<ProviderId, string> = {
  hetzner: "hetzner-cloud",
  digitalocean: "digitalocean",
};

export type ProviderPlan = {
  id: string;
  provider: ProviderId;
  providerName: string;
  name: string;
  cpu: number;
  ram: number;
  storage: number;
  transfer: string;
  priceMonthly: number;
  currency: "USD";
  locations: string;
  note: string;
  sourceUrl: string;
  lastVerified: string;
};

export type PlanMatch = {
  kind: MatchKind;
  label: string;
  reason: string;
  plan: ProviderPlan;
};

const verifiedAt = "2026-08-14";

export const PROVIDER_PLANS: ProviderPlan[] = [
  {
    id: "hetzner-cx23",
    provider: "hetzner",
    providerName: "Hetzner Cloud",
    name: "CX23",
    cpu: 2,
    ram: 4,
    storage: 40,
    transfer: "20 TB",
    priceMonthly: 6.49,
    currency: "USD",
    locations: "Germany / Finland",
    note: "Shared vCPU; price excludes VAT and primary IPv4.",
    sourceUrl: "https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/",
    lastVerified: verifiedAt,
  },
  {
    id: "hetzner-cx33",
    provider: "hetzner",
    providerName: "Hetzner Cloud",
    name: "CX33",
    cpu: 4,
    ram: 8,
    storage: 80,
    transfer: "20 TB",
    priceMonthly: 9.99,
    currency: "USD",
    locations: "Germany / Finland",
    note: "Shared vCPU; price excludes VAT and primary IPv4.",
    sourceUrl: "https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/",
    lastVerified: verifiedAt,
  },
  {
    id: "hetzner-cx43",
    provider: "hetzner",
    providerName: "Hetzner Cloud",
    name: "CX43",
    cpu: 8,
    ram: 16,
    storage: 160,
    transfer: "20 TB",
    priceMonthly: 18.49,
    currency: "USD",
    locations: "Germany / Finland",
    note: "Shared vCPU; price excludes VAT and primary IPv4.",
    sourceUrl: "https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/",
    lastVerified: verifiedAt,
  },
  {
    id: "hetzner-cx53",
    provider: "hetzner",
    providerName: "Hetzner Cloud",
    name: "CX53",
    cpu: 16,
    ram: 32,
    storage: 320,
    transfer: "20 TB",
    priceMonthly: 34.99,
    currency: "USD",
    locations: "Germany / Finland",
    note: "Shared vCPU; price excludes VAT and primary IPv4.",
    sourceUrl: "https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/",
    lastVerified: verifiedAt,
  },
  {
    id: "digitalocean-basic-2-4",
    provider: "digitalocean",
    providerName: "DigitalOcean",
    name: "Basic 2 vCPU",
    cpu: 2,
    ram: 4,
    storage: 80,
    transfer: "4 TB",
    priceMonthly: 24,
    currency: "USD",
    locations: "Global regions",
    note: "Regular shared CPU with SSD storage.",
    sourceUrl: "https://www.digitalocean.com/pricing/droplets",
    lastVerified: verifiedAt,
  },
  {
    id: "digitalocean-basic-4-8",
    provider: "digitalocean",
    providerName: "DigitalOcean",
    name: "Basic 4 vCPU",
    cpu: 4,
    ram: 8,
    storage: 160,
    transfer: "5 TB",
    priceMonthly: 48,
    currency: "USD",
    locations: "Global regions",
    note: "Regular shared CPU with SSD storage.",
    sourceUrl: "https://www.digitalocean.com/pricing/droplets",
    lastVerified: verifiedAt,
  },
  {
    id: "digitalocean-basic-8-16",
    provider: "digitalocean",
    providerName: "DigitalOcean",
    name: "Basic 8 vCPU",
    cpu: 8,
    ram: 16,
    storage: 320,
    transfer: "6 TB",
    priceMonthly: 96,
    currency: "USD",
    locations: "Global regions",
    note: "Regular shared CPU with SSD storage.",
    sourceUrl: "https://www.digitalocean.com/pricing/droplets",
    lastVerified: verifiedAt,
  },
];

function fits(plan: ProviderPlan, estimate: ServerEstimate) {
  return plan.cpu >= estimate.cpu && plan.ram >= estimate.ram && plan.storage >= estimate.storage;
}

function overprovisionScore(plan: ProviderPlan, estimate: ServerEstimate) {
  return (
    plan.cpu / estimate.cpu +
    plan.ram / estimate.ram +
    plan.storage / estimate.storage
  ) / 3;
}

export function matchProviderPlans(estimate: ServerEstimate): PlanMatch[] {
  const eligible = PROVIDER_PLANS.filter((plan) => fits(plan, estimate));
  if (eligible.length === 0) return [];

  const cheapest = [...eligible].sort((a, b) => a.priceMonthly - b.priceMonthly)[0];
  const remaining = eligible.filter((plan) => plan.id !== cheapest.id);
  const bestValue = [...remaining].sort((a, b) => {
    const scoreA = a.priceMonthly * overprovisionScore(a, estimate);
    const scoreB = b.priceMonthly * overprovisionScore(b, estimate);
    return scoreA - scoreB;
  })[0];
  const headroomCandidates = remaining.filter(
    (plan) => plan.cpu >= estimate.cpu * 1.5 && plan.ram >= estimate.ram * 1.5,
  );
  const moreHeadroom = [...headroomCandidates]
    .filter((plan) => plan.id !== bestValue?.id)
    .sort((a, b) => a.priceMonthly - b.priceMonthly)[0];

  const matches: PlanMatch[] = [
    {
      kind: "lowest-price",
      label: "Lowest price",
      reason: "The least expensive catalog plan that meets every estimated resource.",
      plan: cheapest,
    },
  ];

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
