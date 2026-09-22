import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Keep module loading safe during Next.js build-time analysis. Queries still
// fail normally when no database is available, allowing catalogue services to
// use their documented bundled-content fallback in local development.
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/careerbridge";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
