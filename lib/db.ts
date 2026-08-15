import "server-only";

import { Pool, type QueryResultRow } from "pg";

declare global {
  var neroviaxPostgresPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

export function database() {
  if (!globalThis.neroviaxPostgresPool) globalThis.neroviaxPostgresPool = createPool();
  return globalThis.neroviaxPostgresPool;
}

export async function query<Row extends QueryResultRow>(text: string, values: unknown[] = []) {
  return database().query<Row>(text, values);
}
