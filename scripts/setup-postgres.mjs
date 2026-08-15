try {
  await import("./ensure-postgres-database.mjs");
  await import("./migrate-postgres.mjs");
} catch (error) {
  console.error(`PostgreSQL setup failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
