const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const fs = require("fs");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in backend/.env");
  process.exit(1);
}

const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS councils (
  council_id VARCHAR(50) PRIMARY KEY,
  council_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'COUNCIL',
  council_id VARCHAR(50) REFERENCES councils(council_id) ON DELETE SET NULL,
  position VARCHAR(255) DEFAULT '',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  goal_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  council_id VARCHAR(50),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  expected_outcome TEXT DEFAULT '',
  priority VARCHAR(50) DEFAULT 'MEDIUM',
  goal_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  incomplete_reason TEXT DEFAULT '',
  assigned_to VARCHAR(50),
  assigned_to_name VARCHAR(255),
  assigned_by VARCHAR(50),
  assigned_by_name VARCHAR(255),
  is_on_leave BOOLEAN DEFAULT FALSE,
  leave_start_date DATE,
  leave_end_date DATE,
  leave_days VARCHAR(50),
  leave_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reflections (
  reflection_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL,
  achievements TEXT DEFAULT '',
  incomplete_goals TEXT DEFAULT '',
  challenges TEXT DEFAULT '',
  learnings TEXT DEFAULT '',
  improvements TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_feedback (
  feedback_id VARCHAR(50) PRIMARY KEY,
  student_name VARCHAR(255) DEFAULT 'Anonymous',
  council_id VARCHAR(50),
  feedback_type VARCHAR(100) DEFAULT 'General',
  message TEXT NOT NULL,
  contact VARCHAR(255) DEFAULT '',
  status VARCHAR(50) DEFAULT 'PENDING',
  admin_notes TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goal_history (
  history_id VARCHAR(50) PRIMARY KEY,
  goal_id VARCHAR(50) REFERENCES goals(goal_id) ON DELETE CASCADE,
  user_id VARCHAR(50),
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  action VARCHAR(100),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS council_leaves (
  leave_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  member_name VARCHAR(255),
  council_id VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days VARCHAR(50),
  reason TEXT NOT NULL,
  handover_student_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id VARCHAR(50) PRIMARY KEY,
  actor_id VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function initPostgres() {
  console.log("==================================================");
  console.log("   CouncilTrack AI — PostgreSQL Setup & Migration");
  console.log("==================================================");
  console.log("Connecting to:", connectionString.replace(/:[^:@]+@/, ":****@"));

  const client = await pool.connect();
  try {
    console.log("1. Creating database schema tables...");
    await client.query(SCHEMA_SQL);
    console.log("✓ All 9 PostgreSQL tables verified/created successfully!");

    // 2. Check if data exists in counciltrack_store.json to migrate
    const storePath = path.resolve(__dirname, "../data/counciltrack_store.json");
    if (fs.existsSync(storePath)) {
      console.log("\n2. Migrating existing data from local store to PostgreSQL...");
      const store = JSON.parse(fs.readFileSync(storePath, "utf8"));

      // Councils
      if (Array.isArray(store.Councils)) {
        for (const c of store.Councils) {
          await client.query(
            `INSERT INTO councils (council_id, council_name, description, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (council_id) DO UPDATE SET
               council_name = EXCLUDED.council_name,
               description = EXCLUDED.description,
               status = EXCLUDED.status,
               updated_at = EXCLUDED.updated_at`,
            [c.councilId, c.councilName, c.description || "", c.status || "ACTIVE", c.createdAt || new Date(), c.updatedAt || new Date()]
          );
        }
        console.log(`✓ Migrated ${store.Councils.length} Councils`);
      }

      // Users
      if (Array.isArray(store.Users)) {
        for (const u of store.Users) {
          await client.query(
            `INSERT INTO users (user_id, name, email, password_hash, role, council_id, position, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (user_id) DO UPDATE SET
               name = EXCLUDED.name,
               email = EXCLUDED.email,
               password_hash = EXCLUDED.password_hash,
               role = EXCLUDED.role,
               council_id = EXCLUDED.council_id,
               position = EXCLUDED.position,
               status = EXCLUDED.status,
               updated_at = EXCLUDED.updated_at`,
            [
              u.userId,
              u.name,
              u.email,
              u.passwordHash,
              u.role || "COUNCIL",
              u.councilId || null,
              u.position || "",
              u.status || "ACTIVE",
              u.createdAt || new Date(),
              u.updatedAt || new Date(),
            ]
          );
        }
        console.log(`✓ Migrated ${store.Users.length} Users`);
      }

      // Goals
      if (Array.isArray(store.Goals)) {
        for (const g of store.Goals) {
          await client.query(
            `INSERT INTO goals (goal_id, user_id, council_id, title, description, expected_outcome, priority, goal_date, status, incomplete_reason, assigned_to, assigned_to_name, assigned_by, assigned_by_name, is_on_leave, leave_start_date, leave_end_date, leave_days, leave_reason, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
             ON CONFLICT (goal_id) DO NOTHING`,
            [
              g.goalId,
              g.userId,
              g.councilId || null,
              g.title,
              g.description || "",
              g.expectedOutcome || "",
              g.priority || "MEDIUM",
              g.goalDate,
              g.status || "PENDING",
              g.incompleteReason || "",
              g.assignedTo || null,
              g.assignedToName || null,
              g.assignedBy || null,
              g.assignedByName || null,
              !!g.isOnLeave,
              g.leaveStartDate || null,
              g.leaveEndDate || null,
              g.leaveDays || null,
              g.leaveReason || null,
              g.createdAt || new Date(),
              g.updatedAt || new Date(),
            ]
          );
        }
        console.log(`✓ Migrated ${store.Goals.length} Goals`);
      }

      // Reflections
      if (Array.isArray(store.Reflections)) {
        for (const r of store.Reflections) {
          await client.query(
            `INSERT INTO reflections (reflection_id, user_id, reflection_date, achievements, incomplete_goals, challenges, learnings, improvements, submitted_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (reflection_id) DO NOTHING`,
            [
              r.reflectionId,
              r.userId,
              r.reflectionDate,
              r.achievements || "",
              r.incompleteGoals || "",
              r.challenges || "",
              r.learnings || "",
              r.improvements || "",
              r.submittedAt || new Date(),
              r.updatedAt || new Date(),
            ]
          );
        }
        console.log(`✓ Migrated ${store.Reflections.length} Reflections`);
      }
    }

    console.log("\n🎉 PostgreSQL Setup & Data Migration Completed Successfully!");
  } catch (err) {
    console.error("❌ PostgreSQL Setup Failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

initPostgres();
