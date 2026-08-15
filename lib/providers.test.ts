import assert from "node:assert/strict";
import test from "node:test";
import type { CatalogPlan } from "./catalog-types.ts";
import { matchProviderPlans } from "./providers.ts";
import { estimateServer, DEFAULT_WORKLOAD } from "./selector.ts";

function plan(slug: string, cpu: number, ram: number, storage: number, priceMonthly: number, available = true): CatalogPlan {
  return {
    slug, providerSlug: "provider", providerName: "Provider", providerAffiliateLinkId: "provider-link",
    name: slug, cpu, ram, storage, storageType: "NVMe", architecture: "x86_64",
    transferTb: 10, networkSpeedMbps: 1000, egressCostPerGb: 0, ipv4: true, ipv6: true,
    priceMonthly, currency: "USD", setupFee: 0, backupAvailable: true,
    snapshotAvailable: true, slaPercent: 99.9, promotion: "", available,
    sourceUrl: "https://example.com/pricing", note: "", lastUpdated: "2026-08-15",
    locations: [{ id: 1, code: "eu1", name: "Europe One", country: "Germany", region: "Europe" }],
  };
}

const catalog = [
  plan("small", 2, 4, 40, 6),
  plan("medium", 4, 8, 100, 12),
  plan("large", 8, 16, 200, 24),
  plan("unavailable", 16, 64, 2000, 1, false),
];

test("matches only available plans that satisfy the complete estimate", () => {
  const estimate = estimateServer(DEFAULT_WORKLOAD);
  const matches = matchProviderPlans(estimate, catalog);
  assert.ok(matches.length >= 2);
  assert.equal(matches[0].kind, "lowest-price");
  assert.equal(matches[1].kind, "best-value");
  assert.ok(matches.every(({ plan: item }) => item.available && item.cpu >= estimate.cpu && item.ram >= estimate.ram && item.storage >= estimate.storage));
});

test("returns no misleading plan when the catalog cannot fit", () => {
  const estimate = { ...estimateServer(DEFAULT_WORKLOAD), cpu: 32, ram: 64, storage: 1000 };
  assert.deepEqual(matchProviderPlans(estimate, catalog), []);
});

test("applies budget, bandwidth and region constraints", () => {
  const estimate = estimateServer(DEFAULT_WORKLOAD);
  assert.equal(matchProviderPlans(estimate, catalog, { region: "europe", bandwidth: 5, budget: 20 }).length, 1);
  assert.deepEqual(matchProviderPlans(estimate, catalog, { region: "asia-pacific", bandwidth: 1, budget: 100 }), []);
  assert.deepEqual(matchProviderPlans(estimate, catalog, { region: "europe", bandwidth: 20, budget: 100 }), []);
  assert.deepEqual(matchProviderPlans(estimate, catalog, { region: "europe", bandwidth: 1, budget: 5 }), []);
});

test("applies storage, architecture, protection, IP and SLA requirements", () => {
  const estimate = estimateServer(DEFAULT_WORKLOAD).recommended;
  const base = { region: "europe" as const, bandwidth: 1, budget: 100 };
  assert.ok(matchProviderPlans(estimate, catalog, { ...base, storageType: "NVMe", architecture: "x86_64", backupRequired: true, snapshotRequired: true, ipv4Required: true, minimumSla: 99.9 }).length > 0);
  assert.ok(matchProviderPlans(estimate, catalog, { ...base, storageType: "SSD" }).length > 0);
  assert.deepEqual(matchProviderPlans(estimate, catalog.map((item) => ({ ...item, storageType: "SSD" as const })), { ...base, storageType: "NVMe" }), []);
  assert.deepEqual(matchProviderPlans(estimate, catalog, { ...base, architecture: "arm64" }), []);
  assert.deepEqual(matchProviderPlans(estimate, catalog, { ...base, minimumSla: 100 }), []);
});
