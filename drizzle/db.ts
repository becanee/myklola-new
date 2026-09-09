import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

// Singleton untuk dev hot-reload — Next.js dev mount berulang.
// Tanpa guard ini, koneksi pool bocor tiap reload & habis connect limit Supabase.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof drizzle> };

export const db = globalForDb.db ?? drizzle({ client });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
