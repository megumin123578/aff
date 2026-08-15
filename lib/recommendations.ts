import "server-only";

import { randomBytes } from "node:crypto";
import { query } from "./db";
import type { ServerConfiguration, Workload } from "./selector";

export type SavedRecommendation = {
  shareId: string;
  formulaVersion: string;
  workload: Workload;
  minimum: ServerConfiguration;
  recommended: ServerConfiguration;
  matchedPlanSlugs: string[];
  createdAt: string;
};

type RecommendationRow = {
  share_id: string;
  formula_version: string;
  workload: Workload;
  minimum_configuration: ServerConfiguration;
  recommended_configuration: ServerConfiguration;
  matched_plan_slugs: string[];
  created_at: string | Date;
};

export async function saveRecommendation(input: Omit<SavedRecommendation, "shareId" | "createdAt">) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const shareId = randomBytes(8).toString("hex");
    const result = await query<{ share_id: string }>(
      `INSERT INTO recommendation_results (share_id, formula_version, workload,
        minimum_configuration, recommended_configuration, matched_plan_slugs)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6)
       ON CONFLICT (share_id) DO NOTHING RETURNING share_id`,
      [shareId, input.formulaVersion, JSON.stringify(input.workload), JSON.stringify(input.minimum), JSON.stringify(input.recommended), input.matchedPlanSlugs],
    );
    if (result.rows[0]) return shareId;
  }
  throw new Error("Could not allocate recommendation ID");
}

export async function getSavedRecommendation(shareId: string) {
  if (!/^[a-f0-9]{16}$/.test(shareId)) return null;
  const result = await query<RecommendationRow>(
    `SELECT share_id, formula_version, workload, minimum_configuration,
      recommended_configuration, matched_plan_slugs, created_at
     FROM recommendation_results WHERE share_id = $1 LIMIT 1`,
    [shareId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    shareId: row.share_id, formulaVersion: row.formula_version, workload: row.workload,
    minimum: row.minimum_configuration, recommended: row.recommended_configuration,
    matchedPlanSlugs: row.matched_plan_slugs || [],
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  } satisfies SavedRecommendation;
}

export async function getSavedRecommendationCount() {
  const result = await query<{ count: number }>("SELECT count(*)::int AS count FROM recommendation_results");
  return result.rows[0]?.count ?? 0;
}

