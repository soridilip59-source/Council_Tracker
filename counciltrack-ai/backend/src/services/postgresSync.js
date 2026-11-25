const { getPool } = require("../config/db");

let schemaReady = false;

async function ensureSchema() {
  const pool = getPool();
  if (!pool) return false;
  if (schemaReady) return true;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_store (
        sheet_name VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS councils (
        council_id VARCHAR(50) PRIMARY KEY,
        council_name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) DEFAULT '',
        login_email VARCHAR(255) DEFAULT '',
        members JSONB DEFAULT '[]'::jsonb,
        description TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE councils ADD COLUMN IF NOT EXISTS slug VARCHAR(100) DEFAULT '';
      ALTER TABLE councils ADD COLUMN IF NOT EXISTS login_email VARCHAR(255) DEFAULT '';
      ALTER TABLE councils ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]'::jsonb;

      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        slug VARCHAR(100) DEFAULT '',
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'COUNCIL',
        council_id VARCHAR(50),
        position VARCHAR(255) DEFAULT '',
        members JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS slug VARCHAR(100) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]'::jsonb;
    `);
    schemaReady = true;
    return true;
  } catch (err) {
    console.warn("[Neon/Postgres] Schema check warning:", err.message);
    return false;
  }
}

async function syncSheetToPostgres(sheetName, rows = []) {
  const pool = getPool();
  if (!pool) return;

  const ready = await ensureSchema();
  if (!ready) return;

  try {
    // 1. Always persist full sheet snapshot in app_store JSONB
    await pool.query(
      `INSERT INTO app_store (sheet_name, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (sheet_name)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [sheetName, JSON.stringify(rows || [])]
    );

    // 2. Also keep relational councils & users tables in sync for direct SQL inspection
    if (sheetName === "Councils") {
      const ids = rows.map((r) => r.councilId).filter(Boolean);
      if (ids.length > 0) {
        await pool.query(`DELETE FROM councils WHERE council_id <> ALL($1::varchar[])`, [ids]);
      } else {
        await pool.query(`DELETE FROM councils`);
      }

      for (const c of rows) {
        await pool.query(
          `INSERT INTO councils (council_id, council_name, slug, login_email, members, description, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, COALESCE($8::timestamptz, NOW()), COALESCE($9::timestamptz, NOW()))
           ON CONFLICT (council_id) DO UPDATE SET
             council_name = EXCLUDED.council_name,
             slug = EXCLUDED.slug,
             login_email = EXCLUDED.login_email,
             members = EXCLUDED.members,
             description = EXCLUDED.description,
             status = EXCLUDED.status,
             updated_at = EXCLUDED.updated_at`,
          [
            c.councilId,
            c.councilName || "",
            c.slug || "",
            c.loginEmail || "",
            JSON.stringify(Array.isArray(c.members) ? c.members : []),
            c.description || "",
            c.status || "ACTIVE",
            c.createdAt || null,
            c.updatedAt || null,
          ]
        );
      }
    } else if (sheetName === "Users") {
      const ids = rows.map((r) => r.userId).filter(Boolean);
      if (ids.length > 0) {
        await pool.query(`DELETE FROM users WHERE user_id <> ALL($1::varchar[])`, [ids]);
      } else {
        await pool.query(`DELETE FROM users`);
      }

      for (const u of rows) {
        await pool.query(
          `INSERT INTO users (user_id, name, email, slug, password_hash, role, council_id, position, members, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, COALESCE($11::timestamptz, NOW()), COALESCE($12::timestamptz, NOW()))
           ON CONFLICT (user_id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             slug = EXCLUDED.slug,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             council_id = EXCLUDED.council_id,
             position = EXCLUDED.position,
             members = EXCLUDED.members,
             status = EXCLUDED.status,
             updated_at = EXCLUDED.updated_at`,
          [
            u.userId,
            u.name || "",
            u.email || "",
            u.slug || "",
            u.passwordHash || "",
            u.role || "COUNCIL",
            u.councilId || null,
            u.position || "",
            JSON.stringify(Array.isArray(u.members) ? u.members : []),
            u.status || "ACTIVE",
            u.createdAt || null,
            u.updatedAt || null,
          ]
        );
      }
    }
  } catch (err) {
    console.warn(`[Neon/Postgres] Sync warning on ${sheetName}:`, err.message);
  }
}

module.exports = {
  ensureSchema,
  syncSheetToPostgres,
};
