import assert from "node:assert/strict";
import test from "node:test";
import { matchProviderPlans, PROVIDER_PLANS } from "./providers.ts";
import { estimateServer, DEFAULT_WORKLOAD } from "./selector.ts";

test("every provider plan has a source and verification date", () => {
  for (const plan of PROVIDER_PLANS) {
    assert.match(plan.sourceUrl, /^https:\/\//);
    assert.match(plan.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("matches only plans that satisfy the complete estimate", () => {
  const estimate = estimateServer(DEFAULT_WORKLOAD);
  const matches = matchProviderPlans(estimate);

  assert.ok(matches.length >= 2);
  assert.equal(matches[0].kind, "lowest-price");
  assert.equal(matches[1].kind, "best-value");
  assert.ok(matches[1].plan.ram >= matches[0].plan.ram);
  for (const { plan } of matches) {
    assert.ok(plan.cpu >= estimate.cpu);
    assert.ok(plan.ram >= estimate.ram);
    assert.ok(plan.storage >= estimate.storage);
  }
});

test("returns no misleading plan when the catalog cannot fit", () => {
  const estimate = {
    ...estimateServer(DEFAULT_WORKLOAD),
    cpu: 32,
    ram: 64,
    storage: 1000,
  };

  assert.deepEqual(matchProviderPlans(estimate), []);
});
