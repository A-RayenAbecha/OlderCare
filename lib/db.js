import pg from "pg";

const { Pool } = pg;

function jdbcToPostgresUrl(value) {
  if (!value) return "";
  if (value.startsWith("jdbc:postgresql://")) {
    return value.replace("jdbc:", "");
  }
  return value;
}

function buildConnectionString() {
  const rawUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (rawUrl) return normalizeConnectionUrl(rawUrl);

  const url = jdbcToPostgresUrl(process.env.SUPABASE_DB_URL);
  const user = process.env.SUPABASE_DB_USERNAME;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!url || !user || !password) return "";

  const parsed = new URL(url);
  parsed.username = user;
  parsed.password = password;
  return normalizeConnectionUrl(parsed.toString());
}

function normalizeConnectionUrl(value) {
  const parsed = new URL(jdbcToPostgresUrl(value));
  parsed.searchParams.delete("sslmode");
  return parsed.toString();
}

const globalForPool = globalThis;

export const pool = globalForPool.oldercarePool ?? new Pool({
  connectionString: buildConnectionString(),
  ssl: { rejectUnauthorized: false },
  max: Number(process.env.DB_POOL_MAX_SIZE ?? 5),
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000
});

if (process.env.NODE_ENV !== "production") {
  globalForPool.oldercarePool = pool;
}

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
