import { getEnv } from "../config/env.js";
import { createPool } from "./client.js";
import { initSql } from "./init-sql.js";

async function main() {
  const env = getEnv();
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  const pool = createPool(env.databaseUrl);
  await pool.query(initSql);
  await pool.end();
  console.log("Database migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
