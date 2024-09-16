import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DB_URL } from "./config";
import * as schema from './../db-schema';

const pool = new Pool({
  connectionString: DB_URL,
});

export const DB: NodePgDatabase<typeof schema> = drizzle(pool, { schema });
