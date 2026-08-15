import assert from "node:assert/strict";
import test from "node:test";
import type { CatalogPlan } from "./catalog-types.ts";
import { filterAndSortPlans, parsePlanFilters } from "./plan-discovery.ts";

function plan(slug: string, overrides: Partial<CatalogPlan> = {}): CatalogPlan {
  return {
    slug, providerSlug: "provider", providerName: "Provider", providerAffiliateLinkId: "",
    name: slug, cpu: 2, ram: 4, storage: 40, storageType: "SSD", architecture: "x86_64",
    transferTb: 2, networkSpeedMbps: 1000, egressCostPerGb: 0, ipv4: true, ipv6: true,
    priceMonthly: 10, currency: "USD", setupFee: 0, backupAvailable: false,
    snapshotAvailable: true, slaPercent: 99.9, promotion: "", available: true,
    sourceUrl: "https://example.com", note: "", lastUpdated: "2026-08-15",
    locations: [{ id: 1, code: "eu", name: "Europe", country: "Germany", region: "Europe" }],
    ...overrides,
  };
}

const plans = [
  plan("budget", { priceMonthly: 5 }),
  plan("nvme-large", { cpu: 4, ram: 8, storage: 100, storageType: "NVMe", transferTb: 30, priceMonthly: 15, backupAvailable: true }),
  plan("asia", { priceMonthly: 12, locations: [{ id: 2, code: "sg", name: "Singapore", country: "Singapore", region: "Asia Pacific" }] }),
];

test("parses safe URL-driven plan filters", () => {
  const filters = parsePlanFilters(new URLSearchParams("region=Europe&ram=8&price=20&storageType=NVMe&backup=1&sort=value"));
  assert.equal(filters.region, "Europe");
  assert.equal(filters.minRam, 8);
  assert.equal(filters.maxPrice, 20);
  assert.equal(filters.storageType, "NVMe");
  assert.equal(filters.backup, true);
  assert.equal(filters.sort, "value");
});

test("filters plans by resources, features and region", () => {
  const filters = parsePlanFilters(new URLSearchParams("region=Europe&ram=8&transfer=5&storageType=NVMe&backup=1"));
  assert.deepEqual(filterAndSortPlans(plans, filters).map((item) => item.slug), ["nvme-large"]);
});

test("sorts filtered plans by price and value", () => {
  const priceFilters = parsePlanFilters(new URLSearchParams("sort=price"));
  assert.deepEqual(filterAndSortPlans(plans, priceFilters).map((item) => item.slug), ["budget", "asia", "nvme-large"]);
  const valueFilters = parsePlanFilters(new URLSearchParams("sort=value"));
  assert.equal(filterAndSortPlans(plans, valueFilters)[0].slug, "nvme-large");
});
