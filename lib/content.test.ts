import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PROVIDER_AFFILIATE_IDS } from "./providers.ts";

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
  for (const id of Object.values(PROVIDER_AFFILIATE_IDS)) {
    assert.match(seed, new RegExp(`'${id}'`));
    assert.match(seed, new RegExp(`affiliate:${id}\\|`));
  }
  assert.match(seed, /'docker-vps-sizing'/);
  assert.match(seed, /'published'/);
});
