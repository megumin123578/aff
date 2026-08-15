INSERT INTO affiliate_links (id, provider, label, destination_url, affiliate_url, enabled, last_verified, notes)
VALUES
  ('hetzner-cloud', 'Hetzner Cloud', 'View Hetzner Cloud', 'https://www.hetzner.com/cloud/', '', true, '2026-08-14', 'Used by VPS calculator and infrastructure guides.'),
  ('digitalocean', 'DigitalOcean', 'View DigitalOcean Droplets', 'https://www.digitalocean.com/pricing/droplets', '', true, '2026-08-14', 'Used by VPS calculator and infrastructure guides.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO articles (
  slug, title, description, category, tags, status, published_at, updated_at,
  cover_image, affiliate_ids, body_markdown
)
VALUES (
  'docker-vps-sizing',
  'How much server does a Docker stack actually need?',
  'A practical baseline for Docker RAM, CPU, storage, and deployment headroom without provider bloat.',
  'VPS sizing',
  ARRAY['Docker', 'VPS', 'Self-hosting'],
  'published',
  '2026-08-14',
  '2026-08-14',
  '',
  ARRAY['hetzner-cloud', 'digitalocean'],
  $markdown$A small Docker stack rarely needs a large server on day one. The useful starting point is to budget memory per service, reserve space for the operating system, and leave enough headroom for deployments.

## Start with memory, not CPU

For a reverse proxy, application container, worker, and PostgreSQL database, **4–8 GB RAM** is a sensible range. Memory exhaustion is more disruptive than temporary CPU contention because the kernel may terminate a container when the server runs out of RAM.

| Workload | Suggested starting RAM |
| --- | ---: |
| Proxy + one small app | 2–4 GB |
| App + worker + database | 4–8 GB |
| Busy production stack | 8–16 GB |

## Keep deployment headroom

Rolling deployments temporarily run old and new containers together. Reserve at least 20–30% of memory for this overlap, the operating system, monitoring, and filesystem cache.

{{affiliate:hetzner-cloud|Check Hetzner Cloud plans}}

## Validate after deployment

Treat every calculator result as a baseline. Monitor peak memory, CPU steal, disk latency, and database cache hit rate for at least one normal traffic cycle before resizing.

{{affiliate:digitalocean|Compare DigitalOcean Droplets}}$markdown$
)
ON CONFLICT (slug) DO NOTHING;
