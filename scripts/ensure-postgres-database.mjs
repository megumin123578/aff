import process from "node:process";
import pg from "pg";

const targetConnectionString = process.env.DATABASE_URL;
if (!targetConnectionString) throw new Error("DATABASE_URL is required.");

const targetUrl = new URL(targetConnectionString);
const databaseName = decodeURIComponent(targetUrl.pathname.replace(/^\//, ""));
if (!databaseName || databaseName.includes("\0") || Buffer.byteLength(databaseName) > 63) {
  throw new Error("DATABASE_URL must contain a valid PostgreSQL database name (maximum 63 bytes).");
}

async function connect(connectionString) {
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10_000 });
  await client.connect();
  return client;
}

try {
  const targetClient = await connect(targetConnectionString);
  await targetClient.end();
  console.log(`database ${databaseName} exists`);
} catch (error) {
  if (error?.code !== "3D000") throw error;

  const maintenanceUrl = process.env.POSTGRES_MAINTENANCE_URL
    ? new URL(process.env.POSTGRES_MAINTENANCE_URL)
    : new URL(targetConnectionString);
  if (!process.env.POSTGRES_MAINTENANCE_URL) maintenanceUrl.pathname = "/postgres";

  const maintenanceClient = await connect(maintenanceUrl.toString());
  try {
    const existing = await maintenanceClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
    if (existing.rowCount) {
      console.log(`database ${databaseName} exists`);
    } else {
      const quotedName = `"${databaseName.replaceAll('"', '""')}"`;
      try {
        await maintenanceClient.query(`CREATE DATABASE ${quotedName}`);
        console.log(`create database ${databaseName}`);
      } catch (createError) {
        if (createError?.code !== "42P04") throw createError;
        console.log(`database ${databaseName} was created by another process`);
      }
    }
  } finally {
    await maintenanceClient.end();
  }
}
