CREATE TABLE IF NOT EXISTS providers (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  website_url text NOT NULL,
  affiliate_link_id text REFERENCES affiliate_links(id) ON DELETE SET NULL,
  headquarters text NOT NULL DEFAULT '',
  founded_year integer CHECK (founded_year IS NULL OR founded_year BETWEEN 1990 AND 2100),
  features text[] NOT NULL DEFAULT '{}',
  pros text[] NOT NULL DEFAULT '{}',
  cons text[] NOT NULL DEFAULT '{}',
  best_use_cases text[] NOT NULL DEFAULT '{}',
  alternatives text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_locations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider_slug text NOT NULL REFERENCES providers(slug) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  country text NOT NULL,
  region text NOT NULL,
  UNIQUE (provider_slug, code)
);

CREATE TABLE IF NOT EXISTS vps_plans (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  provider_slug text NOT NULL REFERENCES providers(slug) ON DELETE CASCADE,
  name text NOT NULL,
  cpu integer NOT NULL CHECK (cpu > 0),
  ram_gb numeric(10,2) NOT NULL CHECK (ram_gb > 0),
  storage_gb integer NOT NULL CHECK (storage_gb > 0),
  storage_type text NOT NULL DEFAULT 'SSD' CHECK (storage_type IN ('SSD', 'NVMe')),
  architecture text NOT NULL DEFAULT 'x86_64' CHECK (architecture IN ('x86_64', 'arm64')),
  transfer_tb numeric(10,2) CHECK (transfer_tb IS NULL OR transfer_tb >= 0),
  network_speed_mbps integer CHECK (network_speed_mbps IS NULL OR network_speed_mbps > 0),
  egress_cost_per_gb numeric(10,4) CHECK (egress_cost_per_gb IS NULL OR egress_cost_per_gb >= 0),
  ipv4 boolean NOT NULL DEFAULT true,
  ipv6 boolean NOT NULL DEFAULT true,
  price_monthly numeric(10,2) NOT NULL CHECK (price_monthly >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  setup_fee numeric(10,2) NOT NULL DEFAULT 0 CHECK (setup_fee >= 0),
  backup_available boolean NOT NULL DEFAULT false,
  snapshot_available boolean NOT NULL DEFAULT false,
  sla_percent numeric(5,2) CHECK (sla_percent IS NULL OR sla_percent BETWEEN 0 AND 100),
  promotion text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT true,
  source_url text NOT NULL,
  note text NOT NULL DEFAULT '',
  last_updated date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vps_plans_provider_price_idx
  ON vps_plans (provider_slug, available, price_monthly);

CREATE TABLE IF NOT EXISTS plan_locations (
  plan_slug text NOT NULL REFERENCES vps_plans(slug) ON DELETE CASCADE,
  location_id bigint NOT NULL REFERENCES provider_locations(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_slug, location_id)
);

CREATE TABLE IF NOT EXISTS plan_price_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_slug text NOT NULL REFERENCES vps_plans(slug) ON DELETE CASCADE,
  price_monthly numeric(10,2) NOT NULL CHECK (price_monthly >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (plan_slug, recorded_at)
);

CREATE INDEX IF NOT EXISTS plan_price_history_plan_date_idx
  ON plan_price_history (plan_slug, recorded_at DESC);

