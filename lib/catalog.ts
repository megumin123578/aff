import "server-only";

import { database, query } from "./db";
import type { CatalogLocation, CatalogPlan, CatalogProvider } from "./catalog-types";

type ProviderRow = {
  slug: string;
  name: string;
  description: string;
  website_url: string;
  affiliate_link_id: string | null;
  headquarters: string;
  founded_year: number | null;
  features: string[];
  pros: string[];
  cons: string[];
  best_use_cases: string[];
  alternatives: string[];
  active: boolean;
  locations: CatalogLocation[] | null;
};

type PlanRow = {
  slug: string;
  provider_slug: string;
  provider_name: string;
  provider_affiliate_link_id: string | null;
  name: string;
  cpu: number;
  ram_gb: string | number;
  storage_gb: number;
  storage_type: "SSD" | "NVMe";
  architecture: "x86_64" | "arm64";
  transfer_tb: string | number | null;
  network_speed_mbps: number | null;
  egress_cost_per_gb: string | number | null;
  ipv4: boolean;
  ipv6: boolean;
  price_monthly: string | number;
  currency: string;
  setup_fee: string | number;
  backup_available: boolean;
  snapshot_available: boolean;
  sla_percent: string | number | null;
  promotion: string;
  available: boolean;
  source_url: string;
  note: string;
  last_updated: string | Date;
  locations: CatalogLocation[] | null;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const providerColumns = `p.slug, p.name, p.description, p.website_url, p.affiliate_link_id,
  p.headquarters, p.founded_year, p.features, p.pros, p.cons, p.best_use_cases,
  p.alternatives, p.active,
  COALESCE(jsonb_agg(jsonb_build_object('id', l.id, 'code', l.code, 'name', l.name,
    'country', l.country, 'region', l.region) ORDER BY l.region, l.country, l.name)
    FILTER (WHERE l.id IS NOT NULL), '[]'::jsonb) AS locations`;
const planColumns = `v.slug, v.provider_slug, p.name AS provider_name,
  p.affiliate_link_id AS provider_affiliate_link_id, v.name, v.cpu, v.ram_gb,
  v.storage_gb, v.storage_type, v.architecture, v.transfer_tb,
  v.network_speed_mbps, v.egress_cost_per_gb, v.ipv4, v.ipv6,
  v.price_monthly, v.currency, v.setup_fee, v.backup_available,
  v.snapshot_available, v.sla_percent, v.promotion, v.available, v.source_url,
  v.note, v.last_updated,
  COALESCE(jsonb_agg(jsonb_build_object('id', l.id, 'code', l.code, 'name', l.name,
    'country', l.country, 'region', l.region) ORDER BY l.region, l.country, l.name)
    FILTER (WHERE l.id IS NOT NULL), '[]'::jsonb) AS locations`;

function numberOrNull(value: string | number | null) {
  return value === null ? null : Number(value);
}

function dateOnly(value: string | Date) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function providerFromRow(row: ProviderRow): CatalogProvider {
  return {
    slug: row.slug, name: row.name, description: row.description,
    websiteUrl: row.website_url, affiliateLinkId: row.affiliate_link_id || "",
    headquarters: row.headquarters, foundedYear: row.founded_year,
    features: row.features || [], pros: row.pros || [], cons: row.cons || [],
    bestUseCases: row.best_use_cases || [], alternatives: row.alternatives || [],
    active: row.active, locations: row.locations || [],
  };
}

function planFromRow(row: PlanRow): CatalogPlan {
  return {
    slug: row.slug, providerSlug: row.provider_slug, providerName: row.provider_name,
    providerAffiliateLinkId: row.provider_affiliate_link_id || "", name: row.name,
    cpu: row.cpu, ram: Number(row.ram_gb), storage: row.storage_gb,
    storageType: row.storage_type, architecture: row.architecture,
    transferTb: numberOrNull(row.transfer_tb), networkSpeedMbps: row.network_speed_mbps,
    egressCostPerGb: numberOrNull(row.egress_cost_per_gb), ipv4: row.ipv4, ipv6: row.ipv6,
    priceMonthly: Number(row.price_monthly), currency: row.currency.trim(),
    setupFee: Number(row.setup_fee), backupAvailable: row.backup_available,
    snapshotAvailable: row.snapshot_available, slaPercent: numberOrNull(row.sla_percent),
    promotion: row.promotion, available: row.available, sourceUrl: row.source_url,
    note: row.note, lastUpdated: dateOnly(row.last_updated), locations: row.locations || [],
  };
}

export async function getProviders(includeInactive = false) {
  const result = await query<ProviderRow>(
    `SELECT ${providerColumns} FROM providers p
     LEFT JOIN provider_locations l ON l.provider_slug = p.slug
     WHERE ($1::boolean OR p.active) GROUP BY p.slug ORDER BY p.name`,
    [includeInactive],
  );
  return result.rows.map(providerFromRow);
}

export async function getProvider(slug: string, includeInactive = false) {
  if (!slugPattern.test(slug)) return null;
  const result = await query<ProviderRow>(
    `SELECT ${providerColumns} FROM providers p
     LEFT JOIN provider_locations l ON l.provider_slug = p.slug
     WHERE p.slug = $1 AND ($2::boolean OR p.active) GROUP BY p.slug LIMIT 1`,
    [slug, includeInactive],
  );
  return result.rows[0] ? providerFromRow(result.rows[0]) : null;
}

export async function getVpsPlans(options: { includeUnavailable?: boolean; providerSlug?: string } = {}) {
  const result = await query<PlanRow>(
    `SELECT ${planColumns} FROM vps_plans v
     JOIN providers p ON p.slug = v.provider_slug
     LEFT JOIN plan_locations pl ON pl.plan_slug = v.slug
     LEFT JOIN provider_locations l ON l.id = pl.location_id
     WHERE ($1::boolean OR (v.available AND p.active))
       AND ($2::text IS NULL OR v.provider_slug = $2)
     GROUP BY v.slug, p.slug ORDER BY v.price_monthly, p.name, v.name`,
    [Boolean(options.includeUnavailable), options.providerSlug || null],
  );
  return result.rows.map(planFromRow);
}

export async function getVpsPlan(slug: string, includeUnavailable = false) {
  if (!slugPattern.test(slug)) return null;
  const result = await query<PlanRow>(
    `SELECT ${planColumns} FROM vps_plans v
     JOIN providers p ON p.slug = v.provider_slug
     LEFT JOIN plan_locations pl ON pl.plan_slug = v.slug
     LEFT JOIN provider_locations l ON l.id = pl.location_id
     WHERE v.slug = $1 AND ($2::boolean OR (v.available AND p.active))
     GROUP BY v.slug, p.slug LIMIT 1`,
    [slug, includeUnavailable],
  );
  return result.rows[0] ? planFromRow(result.rows[0]) : null;
}

export async function upsertProvider(provider: CatalogProvider) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO providers (slug, name, description, website_url, affiliate_link_id,
        headquarters, founded_year, features, pros, cons, best_use_cases, alternatives, active)
       VALUES ($1, $2, $3, $4, NULLIF($5, ''), $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
        website_url = EXCLUDED.website_url, affiliate_link_id = EXCLUDED.affiliate_link_id,
        headquarters = EXCLUDED.headquarters, founded_year = EXCLUDED.founded_year,
        features = EXCLUDED.features, pros = EXCLUDED.pros, cons = EXCLUDED.cons,
        best_use_cases = EXCLUDED.best_use_cases, alternatives = EXCLUDED.alternatives,
        active = EXCLUDED.active, updated_at = now()`,
      [provider.slug, provider.name, provider.description, provider.websiteUrl,
        provider.affiliateLinkId, provider.headquarters, provider.foundedYear,
        provider.features, provider.pros, provider.cons, provider.bestUseCases,
        provider.alternatives, provider.active],
    );
    await client.query("DELETE FROM provider_locations WHERE provider_slug = $1", [provider.slug]);
    for (const location of provider.locations) {
      await client.query(
        `INSERT INTO provider_locations (provider_slug, code, name, country, region)
         VALUES ($1, $2, $3, $4, $5)`,
        [provider.slug, location.code, location.name, location.country, location.region],
      );
    }
    await client.query(
      `INSERT INTO plan_locations (plan_slug, location_id)
       SELECT v.slug, l.id FROM vps_plans v JOIN provider_locations l ON l.provider_slug = v.provider_slug
       WHERE v.provider_slug = $1 ON CONFLICT DO NOTHING`,
      [provider.slug],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function upsertVpsPlan(plan: CatalogPlan) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO vps_plans (slug, provider_slug, name, cpu, ram_gb, storage_gb,
        storage_type, architecture, transfer_tb, network_speed_mbps, egress_cost_per_gb,
        ipv4, ipv6, price_monthly, currency, setup_fee, backup_available,
        snapshot_available, sla_percent, promotion, available, source_url, note, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24::date)
       ON CONFLICT (slug) DO UPDATE SET provider_slug = EXCLUDED.provider_slug,
        name = EXCLUDED.name, cpu = EXCLUDED.cpu, ram_gb = EXCLUDED.ram_gb,
        storage_gb = EXCLUDED.storage_gb, storage_type = EXCLUDED.storage_type,
        architecture = EXCLUDED.architecture, transfer_tb = EXCLUDED.transfer_tb,
        network_speed_mbps = EXCLUDED.network_speed_mbps,
        egress_cost_per_gb = EXCLUDED.egress_cost_per_gb, ipv4 = EXCLUDED.ipv4,
        ipv6 = EXCLUDED.ipv6, price_monthly = EXCLUDED.price_monthly,
        currency = EXCLUDED.currency, setup_fee = EXCLUDED.setup_fee,
        backup_available = EXCLUDED.backup_available,
        snapshot_available = EXCLUDED.snapshot_available, sla_percent = EXCLUDED.sla_percent,
        promotion = EXCLUDED.promotion, available = EXCLUDED.available,
        source_url = EXCLUDED.source_url, note = EXCLUDED.note,
        last_updated = EXCLUDED.last_updated, updated_at = now()`,
      [plan.slug, plan.providerSlug, plan.name, plan.cpu, plan.ram, plan.storage,
        plan.storageType, plan.architecture, plan.transferTb, plan.networkSpeedMbps,
        plan.egressCostPerGb, plan.ipv4, plan.ipv6, plan.priceMonthly, plan.currency,
        plan.setupFee, plan.backupAvailable, plan.snapshotAvailable, plan.slaPercent,
        plan.promotion, plan.available, plan.sourceUrl, plan.note, plan.lastUpdated],
    );
    await client.query("DELETE FROM plan_locations WHERE plan_slug = $1", [plan.slug]);
    await client.query(
      `INSERT INTO plan_locations (plan_slug, location_id)
       SELECT $1, id FROM provider_locations WHERE provider_slug = $2`,
      [plan.slug, plan.providerSlug],
    );
    await client.query(
      `INSERT INTO plan_price_history (plan_slug, price_monthly, currency, recorded_at)
       VALUES ($1, $2, $3, $4::date)
       ON CONFLICT (plan_slug, recorded_at) DO UPDATE SET
        price_monthly = EXCLUDED.price_monthly, currency = EXCLUDED.currency`,
      [plan.slug, plan.priceMonthly, plan.currency, plan.lastUpdated],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
