import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

let _db: Database | null = null;

/**
 * Lazily initialise the Postgres connection.
 * This avoids crashing at import-time during `next build` when
 * DATABASE_URL is not yet available.
 */
export function getDb(): Database {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Copy .env.example → .env.local and add your Supabase connection string."
    );
  }

  const client = postgres(connectionString, {
    prepare: false, // required for Supabase connection pooler (transaction mode)
    max: 5, // allow parallel queries during SSR
  });

  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
