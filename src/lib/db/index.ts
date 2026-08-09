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
    // The build renders ~1,200 DB-backed pages across 15 worker processes, each
    // with its own pool. 5 was too tight: pages queued, some timed out, and at
    // least one query came back empty mid-render (which is how a missing score
    // reached .toFixed() and killed a whole build). 10 gives headroom without
    // pushing 15 workers past what the Supabase transaction pooler will hold.
    max: 10,
    idle_timeout: 20, // recycle idle connections rather than pinning them
    connect_timeout: 30,
  });

  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
