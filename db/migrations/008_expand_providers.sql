-- 1. Affiliate links
INSERT INTO affiliate_links (id, provider, label, destination_url, affiliate_url, enabled, last_verified, notes)
VALUES
  ('vultr', 'Vultr', 'View Vultr Plans ($100 Credit)', 'https://www.vultr.com/pricing/', '', true, CURRENT_DATE, 'Vultr Cloud Compute and High Frequency NVMe instances.'),
  ('linode', 'Linode', 'View Linode Plans ($100 Credit)', 'https://www.linode.com/pricing/', '', true, CURRENT_DATE, 'Akamai Linode standard instances with global reach.'),
  ('ovhcloud', 'OVHcloud', 'View OVHcloud VPS', 'https://www.ovhcloud.com/en/vps/', '', true, CURRENT_DATE, 'OVHcloud unmetered bandwidth VPS with anti-DDoS.'),
  ('contabo', 'Contabo', 'View Contabo Cloud VPS', 'https://contabo.com/en/vps/', '', true, CURRENT_DATE, 'Contabo budget high-RAM cloud instances.')
ON CONFLICT (id) DO NOTHING;

-- 2. Providers
INSERT INTO providers (
  slug, name, description, website_url, affiliate_link_id, headquarters,
  founded_year, features, pros, cons, best_use_cases, alternatives
)
VALUES
  (
    'vultr', 'Vultr',
    'Global cloud hosting platform featuring 32+ data centers with regular compute and High Frequency NVMe instances.',
    'https://www.vultr.com/', 'vultr', 'West Palm Beach, United States', 2014,
    ARRAY['Hourly billing', 'Custom ISO upload', 'Snapshots', 'VPC Networks', 'Block Storage'],
    ARRAY['32+ global locations', 'High single-core CPU clock speeds on High Frequency plans', 'Flexible OS choices and custom ISOs'],
    ARRAY['Support response times vary', 'Bandwidth overage costs in secondary regions'],
    ARRAY['Game servers', 'Global high-traffic web applications', 'Fast single-core developer workloads'],
    ARRAY['digitalocean', 'hetzner', 'linode']
  ),
  (
    'linode', 'Linode (Akamai)',
    'Developer-first Linux cloud hosting infrastructure backed by Akamai global edge network.',
    'https://www.linode.com/', 'linode', 'Philadelphia, United States', 2003,
    ARRAY['Hourly billing', 'Cloud firewalls', 'Longview server analytics', 'NodeBalancers', 'Managed Databases'],
    ARRAY['Industry-standard documentation and CLI tools', 'Predictable pricing without hidden bandwidth traps', 'Generous included transfer pool'],
    ARRAY['Fewer ultra-budget tiers', 'Backup service is an additional monthly fee'],
    ARRAY['Production web applications', 'Docker / Kubernetes microservices', 'Developer staging environments'],
    ARRAY['digitalocean', 'vultr', 'hetzner']
  ),
  (
    'ovhcloud', 'OVHcloud',
    'European cloud infrastructure leader known for unmetered bandwidth, strong anti-DDoS, and aggressive value.',
    'https://www.ovhcloud.com/', 'ovhcloud', 'Roubaix, France', 1999,
    ARRAY['Unmetered bandwidth', 'Anti-DDoS Game and Standard', 'OpenStack API', 'Custom reverse DNS'],
    ARRAY['Unmetered bandwidth with no surprise egress bills', 'Built-in enterprise Anti-DDoS protection', 'Strong European data sovereignty'],
    ARRAY['Control panel interface has a steep learning curve', 'Support response can be slow on standard tiers'],
    ARRAY['High-bandwidth media streaming', 'European public services', 'DDoS-targeted game and community servers'],
    ARRAY['hetzner', 'contabo']
  ),
  (
    'contabo', 'Contabo',
    'German hosting provider delivering massive RAM and vCPU allocations at entry-level monthly pricing.',
    'https://contabo.com/', 'contabo', 'Munich, Germany', 2003,
    ARRAY['Fast provisioning', 'Object storage add-on', 'Private networking', 'Automated OS reinstalls'],
    ARRAY['Highest RAM-to-price ratio in the hosting market', 'Generous 32 TB transfer limits', 'No contract lock-in on monthly billing'],
    ARRAY['CPU steal can occur during peak neighbor loads', 'Setup fees on monthly commitments in select non-EU locations'],
    ARRAY['Homelab simulation', 'Memory-intensive background workers', 'Large database test environments'],
    ARRAY['hetzner', 'ovhcloud']
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. Provider Locations
INSERT INTO provider_locations (provider_slug, code, name, country, region)
VALUES
  ('vultr', 'ewr', 'New Jersey', 'United States', 'North America'),
  ('vultr', 'fra', 'Frankfurt', 'Germany', 'Europe'),
  ('vultr', 'sgp', 'Singapore', 'Singapore', 'Asia Pacific'),
  ('vultr', 'tok', 'Tokyo', 'Japan', 'Asia Pacific'),
  ('linode', 'us-east', 'Newark', 'United States', 'North America'),
  ('linode', 'eu-central', 'Frankfurt', 'Germany', 'Europe'),
  ('linode', 'ap-south', 'Singapore', 'Singapore', 'Asia Pacific'),
  ('ovhcloud', 'gra', 'Gravelines', 'France', 'Europe'),
  ('ovhcloud', 'bhs', 'Beauharnois', 'Canada', 'North America'),
  ('contabo', 'eu-de', 'Nuremberg', 'Germany', 'Europe'),
  ('contabo', 'us-mo', 'St. Louis', 'United States', 'North America')
ON CONFLICT (provider_slug, code) DO NOTHING;

-- 4. VPS Plans
INSERT INTO vps_plans (
  slug, provider_slug, name, cpu, ram_gb, storage_gb, storage_type,
  architecture, transfer_tb, network_speed_mbps, egress_cost_per_gb,
  ipv4, ipv6, price_monthly, setup_fee, backup_available,
  snapshot_available, sla_percent, promotion, available, source_url, note,
  last_updated
)
VALUES
  -- Vultr
  ('vultr-cloud-1-1', 'vultr', 'Cloud Compute 1 vCPU', 1, 1, 32, 'NVMe', 'x86_64', 1.00, 1000, 0.0100, true, true, 6.00, 0, true, true, 99.99, '', true, 'https://www.vultr.com/pricing/', 'High performance NVMe regular cloud compute.', CURRENT_DATE),
  ('vultr-cloud-2-4', 'vultr', 'Cloud Compute 2 vCPU', 2, 4, 80, 'NVMe', 'x86_64', 3.00, 1000, 0.0100, true, true, 24.00, 0, true, true, 99.99, '', true, 'https://www.vultr.com/pricing/', 'Standard 2 vCPU compute instance with 3 TB transfer.', CURRENT_DATE),
  ('vultr-cloud-4-8', 'vultr', 'Cloud Compute 4 vCPU', 4, 8, 160, 'NVMe', 'x86_64', 4.00, 1000, 0.0100, true, true, 48.00, 0, true, true, 99.99, '', true, 'https://www.vultr.com/pricing/', 'Standard 4 vCPU compute instance with 4 TB transfer.', CURRENT_DATE),

  -- Linode
  ('linode-standard-2', 'linode', 'Linode 2 GB', 1, 2, 50, 'SSD', 'x86_64', 2.00, 1000, 0.0100, true, true, 12.00, 0, true, true, 99.99, '', true, 'https://www.linode.com/pricing/', 'Standard shared Linode 1 vCPU instance.', CURRENT_DATE),
  ('linode-standard-4', 'linode', 'Linode 4 GB', 2, 4, 80, 'SSD', 'x86_64', 4.00, 1000, 0.0100, true, true, 24.00, 0, true, true, 99.99, '', true, 'https://www.linode.com/pricing/', 'Standard shared Linode 2 vCPU instance.', CURRENT_DATE),
  ('linode-standard-8', 'linode', 'Linode 8 GB', 4, 8, 160, 'SSD', 'x86_64', 5.00, 1000, 0.0100, true, true, 48.00, 0, true, true, 99.99, '', true, 'https://www.linode.com/pricing/', 'Standard shared Linode 4 vCPU instance.', CURRENT_DATE),

  -- OVHcloud
  ('ovh-starter', 'ovhcloud', 'VPS Starter', 1, 2, 20, 'SSD', 'x86_64', null, 100, 0.0000, true, true, 4.20, 0, true, true, 99.90, '', true, 'https://www.ovhcloud.com/en/vps/', 'Unmetered bandwidth at 100 Mbps with anti-DDoS.', CURRENT_DATE),
  ('ovh-value', 'ovhcloud', 'VPS Value', 2, 4, 40, 'NVMe', 'x86_64', null, 250, 0.0000, true, true, 7.50, 0, true, true, 99.90, '', true, 'https://www.ovhcloud.com/en/vps/', 'NVMe storage with 250 Mbps unmetered bandwidth.', CURRENT_DATE),
  ('ovh-essential', 'ovhcloud', 'VPS Essential', 4, 8, 80, 'NVMe', 'x86_64', null, 500, 0.0000, true, true, 14.50, 0, true, true, 99.90, '', true, 'https://www.ovhcloud.com/en/vps/', 'NVMe storage with 500 Mbps unmetered bandwidth.', CURRENT_DATE),

  -- Contabo
  ('contabo-cloud-vps-s', 'contabo', 'Cloud VPS S', 4, 8, 75, 'NVMe', 'x86_64', 32.00, 200, 0.0000, true, true, 5.50, 0, true, true, 99.90, '', true, 'https://contabo.com/en/vps/', 'High RAM per dollar ratio with generous 32 TB transfer.', CURRENT_DATE),
  ('contabo-cloud-vps-m', 'contabo', 'Cloud VPS M', 6, 16, 150, 'NVMe', 'x86_64', 32.00, 400, 0.0000, true, true, 11.50, 0, true, true, 99.90, '', true, 'https://contabo.com/en/vps/', '16 GB RAM with 6 vCPUs for database and lab workloads.', CURRENT_DATE)
ON CONFLICT (slug) DO NOTHING;

-- 5. Plan Locations mapping
INSERT INTO plan_locations (plan_slug, location_id)
SELECT plan.slug, loc.id
FROM vps_plans plan
JOIN provider_locations loc ON loc.provider_slug = plan.provider_slug
ON CONFLICT DO NOTHING;

-- 6. Plan Price History initial snapshot
INSERT INTO plan_price_history (plan_slug, price_monthly, currency, recorded_at)
SELECT slug, price_monthly, currency, last_updated
FROM vps_plans
ON CONFLICT (plan_slug, recorded_at) DO NOTHING;
