import process from "node:process";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10_000 });
try {
  const result = await pool.query(`SELECT
    (SELECT count(*)::int FROM articles) AS articles,
    (SELECT count(*)::int FROM affiliate_links) AS affiliate_links,
    (SELECT count(*)::int FROM affiliate_clicks) AS affiliate_clicks`);
  console.log(result.rows[0]);
} finally {
  await pool.end();
}
