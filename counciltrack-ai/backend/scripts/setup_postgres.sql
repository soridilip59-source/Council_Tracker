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
  ('CNL_001', 'Discipline Council', 'Discipline Coordinator (Disco) - Campus conduct, attendance, and code of discipline', 'ACTIVE'),
  ('CNL_002', 'Workout Council', 'Workout Coordinator - Morning fitness, sports, yoga, and physical wellbeing', 'ACTIVE'),
  ('CNL_003', 'Academic Council (SOP)', 'Academic Coordinator (SOP) - School of Programming curriculum, study halls, and learning progress', 'ACTIVE'),
  ('CNL_004', 'Academic Council (SOB)', 'Academic Coordinator (SOB) - School of Business learning modules, projects, and mentoring', 'ACTIVE'),
  ('CNL_005', 'Academic Council (SOF)', 'Academic Coordinator (SOF) - School of Finance coursework, financial literacy, and evaluations', 'ACTIVE'),
  ('CNL_006', 'English Council', 'English Coordinator - Communication skills, public speaking, daily vocabulary, and reading circles', 'ACTIVE'),
  ('CNL_007', 'IT Council', 'IT Coordinator - Lab hardware, network infrastructure, workstations, and tech support', 'ACTIVE'),
  ('CNL_008', 'Health Council', 'Health Coordinator - First aid, medical emergencies, hygiene inspections, and wellness care', 'ACTIVE'),
  ('CNL_009', 'Hackathon Council', 'Hackathon Coordinator - Coding competitions, open source build weekends, and hackathons', 'ACTIVE'),
  ('CNL_010', 'Placement Council', 'Placement Coordinator - Resume reviews, mock interviews, recruiter visits, and job pipelines', 'ACTIVE'),
  ('CNL_011', 'Outreach Council', 'Outreach Coordinator - Community partnerships, school visits, alumni relations, and social impact', 'ACTIVE'),
  ('CNL_012', 'Operations Council', 'Operations Coordinator (Ops) - Campus logistics, mess management, inventory, and facility maintenance', 'ACTIVE'),
  ('CNL_013', 'Culture Council', 'Culture Coordinator - Cultural festivals, morning assemblies, celebration nights, and team building', 'ACTIVE'),
  ('CNL_014', 'Induction Council', 'Induction Coordinator - Welcoming new cohorts, orientation sessions, campus tours, and onboarding', 'ACTIVE')
ON CONFLICT (council_id) DO NOTHING;

-- Seed Admin User and Council accounts (Default Password: Admin@123)
INSERT INTO users (user_id, name, email, password_hash, role, council_id, position, status)
VALUES
  ('USR_001', 'Admin User', 'admin@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'ADMIN', NULL, 'Administrator', 'ACTIVE'),
  ('USR_002', 'Akanksha', 'akanksha@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_001', 'Discipline Coordinator (Disco)', 'ACTIVE'),
  ('USR_003', 'Mohan', 'mohan@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_001', 'Discipline Coordinator (Disco)', 'ACTIVE'),
  ('USR_004', 'Lalita', 'lalita@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_002', 'Workout Coordinator', 'ACTIVE'),
  ('USR_005', 'Radheshyam', 'radheshyam@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_002', 'Workout Coordinator', 'ACTIVE'),
  ('USR_006', 'Gungun', 'gungun@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_003', 'Academic Coordinator (SOP)', 'ACTIVE'),
  ('USR_007', 'Dinesh', 'dinesh@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_004', 'Academic Coordinator (SOB)', 'ACTIVE'),
  ('USR_008', 'Anjali', 'anjali@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_004', 'Academic Coordinator (SOB)', 'ACTIVE'),
  ('USR_009', 'Mukesh', 'mukesh@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_005', 'Academic Coordinator (SOF)', 'ACTIVE'),
  ('USR_010', 'Nikita', 'nikita@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_005', 'Academic Coordinator (SOF)', 'ACTIVE'),
  ('USR_011', 'Dilip', 'dilip@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_006', 'English Coordinator', 'ACTIVE'),
  ('USR_012', 'Deepa', 'deepa@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_006', 'English Coordinator', 'ACTIVE'),
  ('USR_013', 'Khushi', 'khushi.it@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_007', 'IT Coordinator', 'ACTIVE'),
  ('USR_014', 'Subhash', 'subhash@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_007', 'IT Coordinator', 'ACTIVE'),
  ('USR_015', 'Khushi', 'khushi.health@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_008', 'Health Coordinator', 'ACTIVE'),
  ('USR_016', 'Sahdev', 'sahdev@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_008', 'Health Coordinator', 'ACTIVE'),
  ('USR_017', 'Vikky Podiyam', 'vikky@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_009', 'Hackathon Coordinator', 'ACTIVE'),
  ('USR_018', 'Himanshu', 'himanshu@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_010', 'Placement Coordinator', 'ACTIVE'),
  ('USR_019', 'Aakashi', 'aakashi@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_011', 'Outreach Coordinator', 'ACTIVE'),
  ('USR_020', 'Sanjana', 'sanjana@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_012', 'Operations Coordinator (Ops Coordinator)', 'ACTIVE'),
  ('USR_021', 'Ramlal', 'ramlal@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_012', 'Operations Coordinator (Ops Coordinator)', 'ACTIVE'),
  ('USR_022', 'Kranti Kashyap', 'kranti@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_013', 'Culture Coordinator', 'ACTIVE'),
  ('USR_023', 'Vidya', 'vidya@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_013', 'Culture Coordinator', 'ACTIVE'),
  ('USR_024', 'Himani', 'himani@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_013', 'Culture Coordinator', 'ACTIVE'),
  ('USR_025', 'Sona', 'sona@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_014', 'Induction Coordinator', 'ACTIVE'),
  ('USR_026', 'Kajal', 'kajal@counciltrack.org', '$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.', 'COUNCIL', 'CNL_014', 'Induction Coordinator', 'ACTIVE')
ON CONFLICT (user_id) DO NOTHING;
