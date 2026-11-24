const { Pool } = require("pg");

let pool = null;
let isConnected = false;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    const connectionString = process.env.DATABASE_URL;
    const isLocal =
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1") ||
      connectionString.includes("postgres:5432");

    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("[PostgreSQL] Pool error:", err.message);
    });
  }
  return pool;
}

async function testConnection() {
  const p = getPool();
  if (!p) {
    console.log("[PostgreSQL] No DATABASE_URL defined in environment.");
    return false;
  }
  try {
    const client = await p.connect();
    const res = await client.query("SELECT NOW()");
    client.release();
    isConnected = true;
    console.log("[PostgreSQL] Connected successfully to database at:", res.rows[0].now);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn("[PostgreSQL] Connection failed:", err.message);
    return false;
  }
}

module.exports = {
  getPool,
  testConnection,
  isPostgresConnected: () => isConnected,
  query: (text, params) => {
    const p = getPool();
    if (!p) throw new Error("PostgreSQL pool is not initialized");
    return p.query(text, params);
  },
};
