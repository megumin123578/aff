INSERT INTO providers (
  slug, name, description, website_url, affiliate_link_id, headquarters,
  founded_year, features, pros, cons, best_use_cases, alternatives
)
VALUES
  (
    'hetzner', 'Hetzner Cloud',
    'European cloud infrastructure focused on high resource-to-price value.',
    'https://www.hetzner.com/cloud/', 'hetzner-cloud', 'Gunzenhausen, Germany', 1997,
    ARRAY['Hourly billing', 'Private networks', 'Cloud firewalls', 'Snapshots'],
    ARRAY['Strong price-to-performance', 'Large included transfer in Europe'],
    ARRAY['Fewer regions than hyperscale clouds', 'Primary IPv4 may cost extra'],
    ARRAY['Self-hosting', 'European SaaS', 'Development environments'],
    ARRAY['digitalocean']
  ),
  (
    'digitalocean', 'DigitalOcean',
    'Developer-oriented cloud platform with a broad global region footprint.',
    'https://www.digitalocean.com/products/droplets', 'digitalocean', 'New York, United States', 2011,
    ARRAY['Hourly billing', 'Cloud firewalls', 'Monitoring', 'Snapshots'],
    ARRAY['Simple developer experience', 'Broad global regions'],
    ARRAY['Higher price per resource', 'Backups are an additional cost'],
    ARRAY['Developer teams', 'Global applications', 'Managed cloud ecosystem'],
    ARRAY['hetzner']
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO provider_locations (provider_slug, code, name, country, region)
VALUES
  ('hetzner', 'fsn1', 'Falkenstein', 'Germany', 'Europe'),
  ('hetzner', 'nbg1', 'Nuremberg', 'Germany', 'Europe'),
  ('hetzner', 'hel1', 'Helsinki', 'Finland', 'Europe'),
  ('digitalocean', 'nyc', 'New York', 'United States', 'North America'),
  ('digitalocean', 'sfo', 'San Francisco', 'United States', 'North America'),
  ('digitalocean', 'ams', 'Amsterdam', 'Netherlands', 'Europe'),
  ('digitalocean', 'sgp', 'Singapore', 'Singapore', 'Asia Pacific')
ON CONFLICT (provider_slug, code) DO NOTHING;

INSERT INTO vps_plans (
  slug, provider_slug, name, cpu, ram_gb, storage_gb, storage_type,
  architecture, transfer_tb, network_speed_mbps, egress_cost_per_gb,
  ipv4, ipv6, price_monthly, setup_fee, backup_available,
  snapshot_available, sla_percent, promotion, available, source_url, note,
  last_updated
)
VALUES
  ('hetzner-cx23', 'hetzner', 'CX23', 2, 4, 40, 'NVMe', 'x86_64', 20, 10000, 0.0010, true, true, 6.49, 0, true, true, 99.90, '', true, 'https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/', 'Shared vCPU; price excludes VAT and primary IPv4.', '2026-08-14'),
  ('hetzner-cx33', 'hetzner', 'CX33', 4, 8, 80, 'NVMe', 'x86_64', 20, 10000, 0.0010, true, true, 9.99, 0, true, true, 99.90, '', true, 'https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/', 'Shared vCPU; price excludes VAT and primary IPv4.', '2026-08-14'),
  ('hetzner-cx43', 'hetzner', 'CX43', 8, 16, 160, 'NVMe', 'x86_64', 20, 10000, 0.0010, true, true, 18.49, 0, true, true, 99.90, '', true, 'https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/', 'Shared vCPU; price excludes VAT and primary IPv4.', '2026-08-14'),
  ('hetzner-cx53', 'hetzner', 'CX53', 16, 32, 320, 'NVMe', 'x86_64', 20, 10000, 0.0010, true, true, 34.99, 0, true, true, 99.90, '', true, 'https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/', 'Shared vCPU; price excludes VAT and primary IPv4.', '2026-08-14'),
  ('digitalocean-basic-2-4', 'digitalocean', 'Basic 2 vCPU', 2, 4, 80, 'SSD', 'x86_64', 4, 2000, 0.0100, true, true, 24, 0, true, true, 99.99, '', true, 'https://www.digitalocean.com/pricing/droplets', 'Regular shared CPU with SSD storage.', '2026-08-14'),
  ('digitalocean-basic-4-8', 'digitalocean', 'Basic 4 vCPU', 4, 8, 160, 'SSD', 'x86_64', 5, 2000, 0.0100, true, true, 48, 0, true, true, 99.99, '', true, 'https://www.digitalocean.com/pricing/droplets', 'Regular shared CPU with SSD storage.', '2026-08-14'),
  ('digitalocean-basic-8-16', 'digitalocean', 'Basic 8 vCPU', 8, 16, 320, 'SSD', 'x86_64', 6, 2000, 0.0100, true, true, 96, 0, true, true, 99.99, '', true, 'https://www.digitalocean.com/pricing/droplets', 'Regular shared CPU with SSD storage.', '2026-08-14')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO plan_locations (plan_slug, location_id)
SELECT plan.slug, location.id
FROM vps_plans plan
JOIN provider_locations location ON location.provider_slug = plan.provider_slug
ON CONFLICT DO NOTHING;

INSERT INTO plan_price_history (plan_slug, price_monthly, currency, recorded_at)
SELECT slug, price_monthly, currency, last_updated
FROM vps_plans
ON CONFLICT (plan_slug, recorded_at) DO NOTHING;
