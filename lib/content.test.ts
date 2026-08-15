import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("initial migration creates all CMS tables and click indexes", async () => {
  const migration = await readFile("db/migrations/001_initial.sql", "utf8");
  for (const table of ["articles", "affiliate_links", "affiliate_clicks"]) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(migration, /REFERENCES affiliate_links\(id\)/);
  assert.match(migration, /affiliate_clicks_link_time_idx/);
});

test("database seed contains provider registry IDs and article shortcodes", async () => {
  const seed = await readFile("db/migrations/002_seed_content.sql", "utf8");
  for (const id of ["hetzner-cloud", "digitalocean"]) {
    assert.match(seed, new RegExp(`'${id}'`));
    assert.match(seed, new RegExp(`affiliate:${id}\\|`));
  }
  assert.match(seed, /'docker-vps-sizing'/);
  assert.match(seed, /'published'/);
});

test("catalog migrations normalize providers, plans, locations and price history", async () => {
  const [schema, seed] = await Promise.all([
    readFile("db/migrations/003_provider_catalog.sql", "utf8"),
    readFile("db/migrations/004_seed_provider_catalog.sql", "utf8"),
  ]);
  for (const table of ["providers", "provider_locations", "vps_plans", "plan_locations", "plan_price_history"]) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(seed, /'hetzner-cx23'/);
  assert.match(seed, /'digitalocean-basic-2-4'/);
});

test("analytics migration creates the event table and reporting indexes", async () => {
  const migration = await readFile("db/migrations/005_analytics_events.sql", "utf8");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS analytics_events/);
  assert.match(migration, /analytics_events_name_time_idx/);
  assert.match(migration, /properties jsonb/);
});

test("recommendation migration stores versioned immutable result snapshots", async () => {
  const migration = await readFile("db/migrations/006_recommendation_results.sql", "utf8");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS recommendation_results/);
  assert.match(migration, /formula_version text NOT NULL/);
  assert.match(migration, /minimum_configuration jsonb NOT NULL/);
  assert.match(migration, /recommended_configuration jsonb NOT NULL/);
});
