import { defineConfig } from "drizzle-kit";
import { DB_URL } from "./db/config";

if (!DB_URL) {
  throw new Error("DB_URL is not defined in environment variables");
}

export default defineConfig({
  schema: "./db-schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DB_URL,
  },
  verbose: true,
  strict: true,
  // Use tablesFilter to include or exclude specific tables
  tablesFilter: ["!spatial_ref_sys"],
});
