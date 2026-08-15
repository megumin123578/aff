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
    { cpu: 4, ram: 8, storage: 60 },
  );
  assert.deepEqual(
    { cpu: result.minimum.cpu, ram: result.minimum.ram, storage: result.minimum.storage },
    { cpu: 2, ram: 4, storage: 50 },
  );
  assert.equal(result.rawRam, 4.5);
  assert.deepEqual(result.breakdown, {
    application: 1.3,
    database: 1.2,
    redis: 0,
    workers: 0.3,
    containers: 0.4,
    overhead: 1.3,
  });
});

test("adds performance headroom for a busy e-commerce preset", () => {
  const workload: Workload = {
    ...DEFAULT_WORKLOAD,
    application: "wordpress",
    traffic: "busy",
    containers: 4,
    database: true,
    storage: 120,
    environment: "production",
    priority: "performance",
    bandwidth: 5,
    region: "europe",
    budget: 100,
  };

  const result = estimateServer(workload);
  assert.deepEqual(
    { cpu: result.cpu, ram: result.ram, storage: result.storage },
    { cpu: 6, ram: 16, storage: 180 },
  );
  assert.equal(result.rawRam, 7);
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
    ...DEFAULT_WORKLOAD,
    application: "game",
    traffic: "growing",
    containers: 2,
    database: false,
    databaseType: "none",
    databaseSize: 0,
    storage: 90,
    environment: "staging",
    priority: "performance",
    bandwidth: 3,
    region: "asia-pacific",
    budget: 60,
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

test("accounts for Redis, workers, database load and high availability", () => {
  const baseline = estimateServer(DEFAULT_WORKLOAD);
  const advanced = estimateServer({ ...DEFAULT_WORKLOAD, redis: true, workers: 8, databaseLoad: "heavy", databaseSize: 100, highAvailability: true });
  assert.ok(advanced.rawRam > baseline.rawRam);
  assert.ok(advanced.recommended.cpu >= baseline.recommended.cpu);
  assert.equal(advanced.recommended.nodes, 2);
  assert.equal(advanced.recommended.backupRequired, true);
  assert.ok(advanced.warnings.some((warning) => warning.includes("two nodes")));
});
