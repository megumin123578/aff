CREATE TABLE IF NOT EXISTS articles (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Infrastructure',
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at date,
  updated_at date NOT NULL DEFAULT CURRENT_DATE,
  cover_image text NOT NULL DEFAULT '',
  affiliate_ids text[] NOT NULL DEFAULT '{}',
  body_markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_publication_idx
  ON articles (status, published_at DESC);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  provider text NOT NULL,
  label text NOT NULL,
  destination_url text NOT NULL,
  affiliate_url text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  last_verified date NOT NULL DEFAULT CURRENT_DATE,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  affiliate_link_id text NOT NULL REFERENCES affiliate_links(id) ON DELETE RESTRICT,
  source text NOT NULL,
  article_slug text,
  plan_id text,
  placement text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affiliate_clicks_link_time_idx
  ON affiliate_clicks (affiliate_link_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS affiliate_clicks_source_time_idx
  ON affiliate_clicks (source, clicked_at DESC);
