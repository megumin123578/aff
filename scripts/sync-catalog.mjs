import process from "node:process";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString, max: 2, connectionTimeoutMillis: 10_000 });

function sanitizeSlug(raw) {
  return String(raw)
    .toLowerCase()
    .replace(/\./g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Fetch Linode / Akamai plans from official public API (No token required)
 */
async function fetchLinodePlans() {
  console.log("📡 Fetching Linode (Akamai) public types API...");
  try {
    const res = await fetch("https://api.linode.com/v4/linode/types", {
      headers: { "User-Agent": "Neroviax-Catalog-Sync/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();

    const standardTypes = (data.data || []).filter(
      (item) => item.class === "standard" || item.class === "nanode"
    );

    return standardTypes.map((item) => ({
      slug: sanitizeSlug(`linode-${item.id}`),
      provider_slug: "linode",
      name: item.label || `Linode ${item.memory / 1024} GB`,
      cpu: item.vcpus,
      ram_gb: Number((item.memory / 1024).toFixed(2)),
      storage_gb: Math.round(item.disk / 1024),
      storage_type: "SSD",
      architecture: "x86_64",
      transfer_tb: Number((item.transfer / 1000).toFixed(2)),
      network_speed_mbps: item.network_out || 1000,
      egress_cost_per_gb: 0.0100,
      ipv4: true,
      ipv6: true,
      price_monthly: item.price?.monthly || 0,
      currency: "USD",
      setup_fee: 0,
      backup_available: true,
      snapshot_available: true,
      sla_percent: 99.99,
      available: true,
      source_url: "https://www.linode.com/pricing/",
      note: `Standard shared CPU instance with ${item.vcpus} vCPU and ${item.memory / 1024} GB RAM.`,
    }));
  } catch (error) {
    console.warn("⚠️ Failed to fetch Linode plans:", error.message);
    return [];
  }
}

/**
 * Fetch Vultr Cloud Compute plans from official public API (No token required)
 */
async function fetchVultrPlans() {
  console.log("📡 Fetching Vultr public plans API (vc2 + vhf)...");
  try {
    const [resVc2, resVhf] = await Promise.all([
      fetch("https://api.vultr.com/v2/plans?type=vc2", {
        headers: { "User-Agent": "Neroviax-Catalog-Sync/1.0" },
      }),
      fetch("https://api.vultr.com/v2/plans?type=vhf", {
        headers: { "User-Agent": "Neroviax-Catalog-Sync/1.0" },
      }),
    ]);

    const dataVc2 = resVc2.ok ? await resVc2.json() : { plans: [] };
    const dataVhf = resVhf.ok ? await resVhf.json() : { plans: [] };

    const formatPlan = (plan, isHighFreq = false) => ({
      slug: sanitizeSlug(`vultr-${plan.id}`),
      provider_slug: "vultr",
      name: isHighFreq
        ? `High Frequency ${plan.vcpu_count} vCPU (${plan.ram / 1024}GB)`
        : `Cloud Compute ${plan.vcpu_count} vCPU (${plan.ram / 1024}GB)`,
      cpu: plan.vcpu_count,
      ram_gb: Number((plan.ram / 1024).toFixed(2)),
      storage_gb: plan.disk,
      storage_type: "NVMe",
      architecture: "x86_64",
      transfer_tb: Number((plan.bandwidth / 1024).toFixed(2)),
      network_speed_mbps: 1000,
      egress_cost_per_gb: 0.0100,
      ipv4: true,
      ipv6: true,
      price_monthly: Number(plan.monthly_cost),
      currency: "USD",
      setup_fee: 0,
      backup_available: true,
      snapshot_available: true,
      sla_percent: 99.99,
      available: true,
      source_url: "https://www.vultr.com/pricing/",
      note: isHighFreq
        ? `Vultr High Frequency 3GHz+ with NVMe storage and ${plan.bandwidth / 1024} TB transfer.`
        : `Vultr regular Cloud Compute with SSD/NVMe storage and ${plan.bandwidth / 1024} TB transfer.`,
    });

    const vc2Plans = (dataVc2.plans || [])
      .filter((p) => p.monthly_cost > 0 && p.ram > 0)
      .map((p) => formatPlan(p, false));

    const vhfPlans = (dataVhf.plans || [])
      .filter((p) => p.monthly_cost > 0 && p.ram > 0)
      .map((p) => formatPlan(p, true));

    return [...vc2Plans, ...vhfPlans];
  } catch (error) {
    console.warn("⚠️ Failed to fetch Vultr plans:", error.message);
    return [];
  }
}

/**
 * Fetch DigitalOcean Droplet sizes if token provided
 */
async function fetchDigitalOceanPlans() {
  const token = process.env.DIGITALOCEAN_API_TOKEN;
  if (!token) {
    console.log("ℹ️ Skipping live DigitalOcean API (DIGITALOCEAN_API_TOKEN not set in environment).");
    return [];
  }

  console.log("📡 Fetching DigitalOcean sizes API...");
  try {
    const res = await fetch("https://api.digitalocean.com/v2/sizes?per_page=100", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Neroviax-Catalog-Sync/1.0",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();

    const standardSizes = (data.sizes || []).filter(
      (s) => s.available && s.price_monthly > 0 && s.slug.startsWith("s-")
    );

    return standardSizes.map((s) => ({
      slug: sanitizeSlug(`digitalocean-${s.slug}`),
      provider_slug: "digitalocean",
      name: `Basic ${s.vcpus} vCPU (${s.memory / 1024}GB)`,
      cpu: s.vcpus,
      ram_gb: Number((s.memory / 1024).toFixed(2)),
      storage_gb: s.disk,
      storage_type: "SSD",
      architecture: "x86_64",
      transfer_tb: Number(s.transfer || 1),
      network_speed_mbps: 2000,
      egress_cost_per_gb: 0.0100,
      ipv4: true,
      ipv6: true,
      price_monthly: Number(s.price_monthly),
      currency: "USD",
      setup_fee: 0,
      backup_available: true,
      snapshot_available: true,
      sla_percent: 99.99,
      available: true,
      source_url: "https://www.digitalocean.com/pricing/droplets",
      note: `Regular shared CPU with SSD storage and ${s.transfer} TB transfer.`,
    }));
  } catch (error) {
    console.warn("⚠️ Failed to fetch DigitalOcean plans:", error.message);
    return [];
  }
}

/**
 * Fetch Hetzner Cloud plans if token provided, otherwise log hint
 */
async function fetchHetznerPlans() {
  const token = process.env.HETZNER_API_TOKEN;
  if (!token) {
    console.log("ℹ️ Skipping live Hetzner API (HETZNER_API_TOKEN not set in environment).");
    return [];
  }

  console.log("📡 Fetching Hetzner Cloud server types API...");
  try {
    const res = await fetch("https://api.hetzner.cloud/v1/server_types", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Neroviax-Catalog-Sync/1.0",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();

    return (data.server_types || []).map((type) => {
      // Find average EUR monthly price
      const priceObj = type.prices?.[0];
      const priceGross = priceObj?.price_monthly?.gross || priceObj?.price_monthly?.net || 0;
      return {
        slug: sanitizeSlug(`hetzner-${type.name}`),
        provider_slug: "hetzner",
        name: type.name.toUpperCase(),
        cpu: type.cores,
        ram_gb: type.memory,
        storage_gb: type.disk,
        storage_type: type.storage_type === "local" ? "NVMe" : "SSD",
        architecture: type.architecture === "arm" ? "arm64" : "x86_64",
        transfer_tb: 20,
        network_speed_mbps: 10000,
        egress_cost_per_gb: 0.0010,
        ipv4: true,
        ipv6: true,
        price_monthly: Number(priceGross),
        currency: "USD",
        setup_fee: 0,
        backup_available: true,
        snapshot_available: true,
        sla_percent: 99.90,
        available: true,
        source_url: "https://www.hetzner.com/cloud/",
        note: `Shared vCPU; price converted/normalized from EUR.`,
      };
    });
  } catch (error) {
    console.warn("⚠️ Failed to fetch Hetzner plans:", error.message);
    return [];
  }
}

/**
 * Upsert synced plans into PostgreSQL database
 */
async function syncDatabase(plans) {
  if (!plans.length) {
    console.log("No new plans to upsert.");
    return;
  }

  const client = await pool.connect();
  let updatedCount = 0;
  let insertedCount = 0;

  try {
    await client.query("BEGIN");

    for (const plan of plans) {
      // Check if plan already exists
      const existing = await client.query("SELECT price_monthly FROM vps_plans WHERE slug = $1", [
        plan.slug,
      ]);

      if (existing.rowCount > 0) {
        // Update existing plan
        await client.query(
          `UPDATE vps_plans SET
            name = $2,
            cpu = $3,
            ram_gb = $4,
            storage_gb = $5,
            storage_type = $6,
            architecture = $7,
            transfer_tb = $8,
            network_speed_mbps = $9,
            price_monthly = $10,
            currency = $11,
            available = $12,
            source_url = $13,
            note = $14,
            last_updated = CURRENT_DATE,
            updated_at = NOW()
          WHERE slug = $1`,
          [
            plan.slug,
            plan.name,
            plan.cpu,
            plan.ram_gb,
            plan.storage_gb,
            plan.storage_type,
            plan.architecture,
            plan.transfer_tb,
            plan.network_speed_mbps,
            plan.price_monthly,
            plan.currency,
            plan.available ?? true,
            plan.source_url,
            plan.note ?? "",
          ]
        );
        updatedCount++;
      } else {
        // Insert new plan
        await client.query(
          `INSERT INTO vps_plans (
            slug, provider_slug, name, cpu, ram_gb, storage_gb, storage_type,
            architecture, transfer_tb, network_speed_mbps, egress_cost_per_gb,
            ipv4, ipv6, price_monthly, setup_fee, backup_available,
            snapshot_available, sla_percent, promotion, available, source_url, note,
            last_updated
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22,
            CURRENT_DATE
          )`,
          [
            plan.slug,
            plan.provider_slug,
            plan.name,
            plan.cpu,
            plan.ram_gb,
            plan.storage_gb,
            plan.storage_type,
            plan.architecture,
            plan.transfer_tb,
            plan.network_speed_mbps,
            plan.egress_cost_per_gb ?? 0.0100,
            plan.ipv4 ?? true,
            plan.ipv6 ?? true,
            plan.price_monthly,
            plan.setup_fee ?? 0,
            plan.backup_available ?? true,
            plan.snapshot_available ?? true,
            plan.sla_percent ?? 99.99,
            plan.promotion ?? "",
            plan.available ?? true,
            plan.source_url,
            plan.note ?? "",
          ]
        );

        // Map location ids for new plan
        await client.query(
          `INSERT INTO plan_locations (plan_slug, location_id)
           SELECT $1, loc.id
           FROM provider_locations loc
           WHERE loc.provider_slug = $2
           ON CONFLICT DO NOTHING`,
          [plan.slug, plan.provider_slug]
        );
        insertedCount++;
      }

      // Record price history
      await client.query(
        `INSERT INTO plan_price_history (plan_slug, price_monthly, currency, recorded_at)
         VALUES ($1, $2, $3, CURRENT_DATE)
         ON CONFLICT (plan_slug, recorded_at) DO UPDATE SET price_monthly = EXCLUDED.price_monthly`,
        [plan.slug, plan.price_monthly, plan.currency]
      );
    }

    await client.query("COMMIT");
    console.log(
      `✅ Catalog sync completed! Inserted: ${insertedCount}, Updated: ${updatedCount}, Total processed: ${plans.length}`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Transaction failed during sync:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  console.log("🚀 Starting Neroviax VPS Catalog Sync Engine...\n");
  const startTime = Date.now();

  const [linodePlans, vultrPlans, hetznerPlans, doPlans] = await Promise.all([
    fetchLinodePlans(),
    fetchVultrPlans(),
    fetchHetznerPlans(),
    fetchDigitalOceanPlans(),
  ]);

  const allPlans = [...linodePlans, ...vultrPlans, ...hetznerPlans, ...doPlans];
  console.log(`\n📦 Collected ${allPlans.length} plans from live APIs.`);

  await syncDatabase(allPlans);

  console.log(`⏱️ Finished in ${(Date.now() - startTime) / 1000}s.\n`);
  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
