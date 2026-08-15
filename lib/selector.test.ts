import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_WORKLOAD,
  estimateServer,
  validateWorkload,
  workloadFromSearchParams,
  workloadToSearchParams,
  type Workload,
} from "./selector.ts";

test("estimates the balanced production baseline", () => {
  const result = estimateServer(DEFAULT_WORKLOAD);

  assert.deepEqual(
    { cpu: result.cpu, ram: result.ram, storage: result.storage },
    { cpu: 4, ram: 8, storage: 40 },
  );
  assert.equal(result.rawRam, 4.3);
  assert.deepEqual(result.breakdown, {
    application: 1,
    database: 1.5,
    containers: 0.5,
    overhead: 1.3,
  });
});

test("adds performance headroom for a busy e-commerce preset", () => {
  const workload: Workload = {
    application: "wordpress",
    traffic: "busy",
    containers: 4,
    database: true,
    storage: 120,
    environment: "production",
    priority: "performance",
  };

  const result = estimateServer(workload);
  assert.deepEqual(
    { cpu: result.cpu, ram: result.ram, storage: result.storage },
    { cpu: 8, ram: 16, storage: 140 },
  );
  assert.equal(result.rawRam, 8.8);
});

test("reports invalid and single-node risk inputs", () => {
  const invalid = validateWorkload({ ...DEFAULT_WORKLOAD, containers: 0, storage: 5000 });
  assert.equal(invalid.errors.length, 2);

  const risky = validateWorkload({ ...DEFAULT_WORKLOAD, containers: 31, priority: "economy", traffic: "busy" });
  assert.equal(risky.errors.length, 0);
  assert.ok(risky.warnings.length >= 3);
});

test("round-trips every workload field through URL parameters", () => {
  const workload: Workload = {
    application: "game",
    traffic: "growing",
    containers: 2,
    database: false,
    storage: 90,
    environment: "staging",
    priority: "performance",
  };

  assert.deepEqual(workloadFromSearchParams(workloadToSearchParams(workload)), workload);
});

test("falls back safely when URL values are invalid", () => {
  const parsed = workloadFromSearchParams(
    new URLSearchParams("app=unknown&containers=-4&storage=oops&database=0"),
  );

  assert.equal(parsed.application, DEFAULT_WORKLOAD.application);
  assert.equal(parsed.containers, DEFAULT_WORKLOAD.containers);
  assert.equal(parsed.storage, DEFAULT_WORKLOAD.storage);
  assert.equal(parsed.database, false);
});
