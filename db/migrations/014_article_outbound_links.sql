CREATE TABLE IF NOT EXISTS article_outbound_links (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_slug text NOT NULL REFERENCES articles(slug) ON DELETE CASCADE,
  source_url text NOT NULL,
  destination_url text NOT NULL,
  label text NOT NULL DEFAULT '',
  impressions bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_slug, source_url)
);

CREATE INDEX IF NOT EXISTS article_outbound_links_article_idx
  ON article_outbound_links (article_slug);

CREATE INDEX IF NOT EXISTS article_outbound_links_impressions_idx
  ON article_outbound_links (impressions DESC);
