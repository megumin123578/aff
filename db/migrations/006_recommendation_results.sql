CREATE TABLE IF NOT EXISTS recommendation_results (
  share_id text PRIMARY KEY CHECK (share_id ~ '^[a-f0-9]{16}$'),
  formula_version text NOT NULL,
  workload jsonb NOT NULL,
  minimum_configuration jsonb NOT NULL,
  recommended_configuration jsonb NOT NULL,
  matched_plan_slugs text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recommendation_results_created_idx
  ON recommendation_results (created_at DESC);

