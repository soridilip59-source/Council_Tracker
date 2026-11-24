-- PostgreSQL Database Initialization Schema for CouncilTrack AI
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

-- Seed Councils
INSERT INTO councils (council_id, council_name, description, status)
VALUES
  ('CNL_001', 'English Council', 'English language facilitation and peer learning', 'ACTIVE'),
  ('CNL_002', 'Academic Council', 'Curriculum progression, doubt-clearing, and study routines', 'ACTIVE'),
  ('CNL_003', 'Culture Council', 'Campus culture, community events, and house spirit', 'ACTIVE'),
  ('CNL_004', 'Discipline Council', 'Campus code of conduct, morning assembly, and campus safety', 'ACTIVE'),
  ('CNL_005', 'Kitchen Council', 'Mess management, hygiene, meal planning, and nutrition', 'ACTIVE')
ON CONFLICT (council_id) DO NOTHING;

-- Seed Admin User (Password: admin@navgurukul.org hashed)
-- and Default Council accounts (Password: Council@123 hashed)
INSERT INTO users (user_id, name, email, password_hash, role, council_id, position, status)
VALUES
  ('USR_ADMIN', 'Administrator', 'admin@navgurukul.org', '$2a$10$w826a7N06lQyX93Q19fI5.pU9gqD5aP6e2j6T8O9k6.o1O2P3q4eS', 'ADMIN', NULL, 'Campus Administrator', 'ACTIVE'),
  ('USR_ENG', 'English Facilitator', 'englishfacilitator@navgurukul.org', '$2a$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_001', 'English Facilitator', 'ACTIVE'),
  ('USR_ACAD', 'Academic Facilitator', 'academicfacilitator@navgurukul.org', '$2a$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_002', 'Academic Facilitator', 'ACTIVE'),
  ('USR_002', 'Rahul Sharma', 'rahul@counciltrack.org', '$2a$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_001', 'Culture Coordinator', 'ACTIVE')
ON CONFLICT (user_id) DO NOTHING;
