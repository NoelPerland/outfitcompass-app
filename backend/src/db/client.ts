import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

export type AppDatabase = NodePgDatabase<typeof schema>;

export function createPool(connectionString: string) {
  return new Pool({ connectionString });
}

export function createDatabase(pool: Pool): AppDatabase {
  return drizzle(pool, { schema });
}
