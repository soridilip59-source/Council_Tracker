const fs = require("fs");
const path = require("path");

const now = new Date().toISOString();
// Default password: Admin@123
const DEFAULT_HASH = "$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.";

const councils = [
  { councilId: "CNL_001", councilName: "Discipline Council", description: "Discipline Coordinator (Disco) - Campus conduct, attendance, and code of discipline", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_002", councilName: "Workout Council", description: "Workout Coordinator - Morning fitness, sports, yoga, and physical wellbeing", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_003", councilName: "Academic Council (SOP)", description: "Academic Coordinator (SOP) - School of Programming curriculum, study halls, and learning progress", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_004", councilName: "Academic Council (SOB)", description: "Academic Coordinator (SOB) - School of Business learning modules, projects, and mentoring", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_005", councilName: "Academic Council (SOF)", description: "Academic Coordinator (SOF) - School of Finance coursework, financial literacy, and evaluations", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_006", councilName: "English Council", description: "English Coordinator - Communication skills, public speaking, daily vocabulary, and reading circles", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_007", councilName: "IT Council", description: "IT Coordinator - Lab hardware, network infrastructure, workstations, and tech support", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_008", councilName: "Health Council", description: "Health Coordinator - First aid, medical emergencies, hygiene inspections, and wellness care", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_009", councilName: "Hackathon Council", description: "Hackathon Coordinator - Coding competitions, open source build weekends, and hackathons", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_010", councilName: "Placement Council", description: "Placement Coordinator - Resume reviews, mock interviews, recruiter visits, and job pipelines", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_011", councilName: "Outreach Council", description: "Outreach Coordinator - Community partnerships, school visits, alumni relations, and social impact", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_012", councilName: "Operations Council", description: "Operations Coordinator (Ops) - Campus logistics, mess management, inventory, and facility maintenance", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_013", councilName: "Culture Council", description: "Culture Coordinator - Cultural festivals, morning assemblies, celebration nights, and team building", status: "ACTIVE", createdAt: now, updatedAt: now },
  { councilId: "CNL_014", councilName: "Induction Council", description: "Induction Coordinator - Welcoming new cohorts, orientation sessions, campus tours, and onboarding", status: "ACTIVE", createdAt: now, updatedAt: now },
];

const users = [
  { userId: "USR_001", name: "Admin User", email: "admin@counciltrack.org", passwordHash: DEFAULT_HASH, role: "ADMIN", councilId: "", position: "Administrator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_002", name: "Akanksha", email: "akanksha@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_001", position: "Discipline Coordinator (Disco)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_003", name: "Mohan", email: "mohan@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_001", position: "Discipline Coordinator (Disco)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_004", name: "Lalita", email: "lalita@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_002", position: "Workout Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_005", name: "Radheshyam", email: "radheshyam@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_002", position: "Workout Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_006", name: "Gungun", email: "gungun@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_003", position: "Academic Coordinator (SOP)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_007", name: "Dinesh", email: "dinesh@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_004", position: "Academic Coordinator (SOB)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_008", name: "Anjali", email: "anjali@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_004", position: "Academic Coordinator (SOB)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_009", name: "Mukesh", email: "mukesh@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_005", position: "Academic Coordinator (SOF)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_010", name: "Nikita", email: "nikita@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_005", position: "Academic Coordinator (SOF)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_011", name: "Dilip", email: "dilip@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_006", position: "English Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_012", name: "Deepa", email: "deepa@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_006", position: "English Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_013", name: "Khushi", email: "khushi.it@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_007", position: "IT Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_014", name: "Subhash", email: "subhash@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_007", position: "IT Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_015", name: "Khushi", email: "khushi.health@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_008", position: "Health Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_016", name: "Sahdev", email: "sahdev@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_008", position: "Health Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_017", name: "Vikky Podiyam", email: "vikky@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_009", position: "Hackathon Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_018", name: "Himanshu", email: "himanshu@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_010", position: "Placement Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_019", name: "Aakashi", email: "aakashi@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_011", position: "Outreach Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_020", name: "Sanjana", email: "sanjana@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_012", position: "Operations Coordinator (Ops Coordinator)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_021", name: "Ramlal", email: "ramlal@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_012", position: "Operations Coordinator (Ops Coordinator)", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_022", name: "Kranti Kashyap", email: "kranti@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_013", position: "Culture Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_023", name: "Vidya", email: "vidya@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_013", position: "Culture Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_024", name: "Himani", email: "himani@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_013", position: "Culture Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_025", name: "Sona", email: "sona@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_014", position: "Induction Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
  { userId: "USR_026", name: "Kajal", email: "kajal@counciltrack.org", passwordHash: DEFAULT_HASH, role: "COUNCIL", councilId: "CNL_014", position: "Induction Coordinator", status: "ACTIVE", createdAt: now, updatedAt: now },
];

const settings = [
  { settingKey: "APP_NAME", settingValue: "CouncilTrack AI", description: "Official Platform Name for NavGurukul Dantewada", updatedAt: now },
  { settingKey: "TIMEZONE", settingValue: "Asia/Kolkata", description: "Default Platform Timezone", updatedAt: now },
  { settingKey: "FEEDBACK_ENABLED", settingValue: "TRUE", description: "Enable public feedback submission", updatedAt: now },
  { settingKey: "FEEDBACK_FORM_PATH", settingValue: "/feedback", description: "Public URL route for student feedback", updatedAt: now },
];

const auditLogs = [
  { logId: "LOG_001", actorId: "USR_001", action: "SYSTEM_INITIALIZED", entityType: "SYSTEM", entityId: "SYS_INIT", details: "Initialized 14 Official Councils and 25 Coordinators", createdAt: now }
];

const cleanStore = {
  Users: users,
  Councils: councils,
  Goals: [],
  Reflections: [],
  Student_Feedback: [],
  Goal_History: [],
  Audit_Logs: auditLogs,
  Settings: settings,
  Council_Leaves: []
};

const storePath = path.resolve(__dirname, "../data/counciltrack_store.json");
fs.writeFileSync(storePath, JSON.stringify(cleanStore, null, 2), "utf8");
console.log("Successfully wrote cleanStore to", storePath);
console.log("Total Councils:", councils.length, "Total Users:", users.length);
