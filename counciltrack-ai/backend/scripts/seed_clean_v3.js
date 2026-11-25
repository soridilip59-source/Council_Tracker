const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

async function seedClean() {
  const now = new Date().toISOString();
  // Default password: Admin@123
  const DEFAULT_HASH = await bcrypt.hash("Admin@123", 10);

  const councils = [
    {
      councilId: "CNL_001",
      councilName: "Discipline Council",
      slug: "discipline",
      loginEmail: "discipline@counciltrack.org",
      description: "Campus conduct, attendance, and code of discipline",
      members: [
        { memberId: "MEM_001", name: "Akanksha Dewangan", email: "akanksha@counciltrack.org", position: "Discipline Coordinator (Disco)" },
        { memberId: "MEM_002", name: "Mohan", email: "mohan@counciltrack.org", position: "Discipline Coordinator (Disco)" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_002",
      councilName: "Workout Council",
      slug: "workout",
      loginEmail: "workout@counciltrack.org",
      description: "Morning fitness, sports, yoga, and physical wellbeing",
      members: [
        { memberId: "MEM_003", name: "Lalita", email: "lalita@counciltrack.org", position: "Workout Coordinator" },
        { memberId: "MEM_004", name: "Radheshyam", email: "radheshyam@counciltrack.org", position: "Workout Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_003",
      councilName: "Academic Council (SOP)",
      slug: "sop",
      loginEmail: "sop@counciltrack.org",
      description: "School of Programming curriculum, study halls, and learning progress",
      members: [
        { memberId: "MEM_005", name: "Gungun", email: "gungun@counciltrack.org", position: "Academic Coordinator (SOP)" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_004",
      councilName: "Academic Council (SOB)",
      slug: "sob",
      loginEmail: "sob@counciltrack.org",
      description: "School of Business learning modules, projects, and mentoring",
      members: [
        { memberId: "MEM_006", name: "Dinesh", email: "dinesh@counciltrack.org", position: "Academic Coordinator (SOB)" },
        { memberId: "MEM_007", name: "Anjali", email: "anjali@counciltrack.org", position: "Academic Coordinator (SOB)" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_005",
      councilName: "Academic Council (SOF)",
      slug: "sof",
      loginEmail: "sof@counciltrack.org",
      description: "School of Finance coursework, financial literacy, and evaluations",
      members: [
        { memberId: "MEM_008", name: "Mukesh", email: "mukesh@counciltrack.org", position: "Academic Coordinator (SOF)" },
        { memberId: "MEM_009", name: "Nikita", email: "nikita@counciltrack.org", position: "Academic Coordinator (SOF)" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_006",
      councilName: "English Council",
      slug: "english",
      loginEmail: "english@counciltrack.org",
      description: "Communication skills, public speaking, daily vocabulary, and reading circles",
      members: [
        { memberId: "MEM_010", name: "Dilip", email: "dilip@counciltrack.org", position: "English Coordinator" },
        { memberId: "MEM_011", name: "Deepa", email: "deepa@counciltrack.org", position: "English Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_007",
      councilName: "IT Council",
      slug: "it",
      loginEmail: "it@counciltrack.org",
      description: "Lab hardware, network infrastructure, workstations, and tech support",
      members: [
        { memberId: "MEM_012", name: "Khushi", email: "khushi.it@counciltrack.org", position: "IT Coordinator" },
        { memberId: "MEM_013", name: "Subhash", email: "subhash@counciltrack.org", position: "IT Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_008",
      councilName: "Health Council",
      slug: "health",
      loginEmail: "health@counciltrack.org",
      description: "First aid, medical emergencies, hygiene inspections, and wellness care",
      members: [
        { memberId: "MEM_014", name: "Khushi", email: "khushi.health@counciltrack.org", position: "Health Coordinator" },
        { memberId: "MEM_015", name: "Sahdev", email: "sahdev@counciltrack.org", position: "Health Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_009",
      councilName: "Hackathon Council",
      slug: "hackathon",
      loginEmail: "hackathon@counciltrack.org",
      description: "Coding competitions, open source build weekends, and hackathons",
      members: [
        { memberId: "MEM_016", name: "Vikky Podiyam", email: "vikky@counciltrack.org", position: "Hackathon Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_010",
      councilName: "Placement Council",
      slug: "placement",
      loginEmail: "placement@counciltrack.org",
      description: "Resume reviews, mock interviews, recruiter visits, and job pipelines",
      members: [
        { memberId: "MEM_017", name: "Himanshu", email: "himanshu@counciltrack.org", position: "Placement Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_011",
      councilName: "Outreach Council",
      slug: "outreach",
      loginEmail: "outreach@counciltrack.org",
      description: "Community partnerships, school visits, alumni relations, and social impact",
      members: [
        { memberId: "MEM_018", name: "Aakashi", email: "aakashi@counciltrack.org", position: "Outreach Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_012",
      councilName: "Operations Council",
      slug: "operations",
      loginEmail: "operations@counciltrack.org",
      description: "Campus logistics, mess management, inventory, and facility maintenance",
      members: [
        { memberId: "MEM_019", name: "Sanjana", email: "sanjana@counciltrack.org", position: "Operations Coordinator (Ops Coordinator)" },
        { memberId: "MEM_020", name: "Ramlal", email: "ramlal@counciltrack.org", position: "Operations Coordinator (Ops Coordinator)" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_013",
      councilName: "Culture Council",
      slug: "culture",
      loginEmail: "culture@counciltrack.org",
      description: "Cultural festivals, morning assemblies, celebration nights, and team building",
      members: [
        { memberId: "MEM_021", name: "Kranti Kashyap", email: "kranti@counciltrack.org", position: "Culture Coordinator" },
        { memberId: "MEM_022", name: "Vidya", email: "vidya@counciltrack.org", position: "Culture Coordinator" },
        { memberId: "MEM_023", name: "Himani", email: "himani@counciltrack.org", position: "Culture Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    },
    {
      councilId: "CNL_014",
      councilName: "Induction Council",
      slug: "induction",
      loginEmail: "induction@counciltrack.org",
      description: "Welcoming new cohorts, orientation sessions, campus tours, and onboarding",
      members: [
        { memberId: "MEM_024", name: "Sona", email: "sona@counciltrack.org", position: "Induction Coordinator" },
        { memberId: "MEM_025", name: "Kajal", email: "kajal@counciltrack.org", position: "Induction Coordinator" }
      ],
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    }
  ];

  // Users table: Admin + 1 account per Council (with coordinator aliases)
  const users = [
    {
      userId: "USR_001",
      name: "Admin User",
      email: "admin@counciltrack.org",
      passwordHash: DEFAULT_HASH,
      role: "ADMIN",
      councilId: "",
      position: "Administrator",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    }
  ];

  councils.forEach((c, idx) => {
    users.push({
      userId: `USR_CNL_${String(idx + 1).padStart(3, "0")}`,
      name: c.councilName,
      email: c.loginEmail,
      slug: c.slug,
      passwordHash: DEFAULT_HASH,
      role: "COUNCIL",
      councilId: c.councilId,
      position: `${c.councilName} Lead`,
      members: c.members,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now
    });
  });

  const settings = [
    { settingKey: "APP_NAME", settingValue: "CouncilTrack AI", description: "Official Platform Name for NavGurukul Dantewada", updatedAt: now },
    { settingKey: "TIMEZONE", settingValue: "Asia/Kolkata", description: "Default Platform Timezone", updatedAt: now },
    { settingKey: "FEEDBACK_ENABLED", settingValue: "TRUE", description: "Enable public feedback submission", updatedAt: now },
    { settingKey: "FEEDBACK_FORM_PATH", settingValue: "/feedback", description: "Public URL route for student feedback", updatedAt: now },
  ];

  const auditLogs = [
    {
      logId: "LOG_001",
      actorId: "USR_001",
      action: "DATABASE_CLEAN_RESET",
      entityType: "SYSTEM",
      entityId: "SYS_INIT",
      details: "Initialized clean system with 14 Councils (1 account per council) and 25 official Coordinators. All mock data cleared.",
      createdAt: now
    }
  ];

  const cleanStore = {
    Users: users,
    Councils: councils,
    Goals: [],
    Reflections: [],
    Weekly_Goals: [],
    Student_Feedback: [],
    Goal_History: [],
    Audit_Logs: auditLogs,
    Settings: settings,
    Council_Leaves: [],
    Notifications: [] // Empty discord notifications queue
  };

  const storePath = path.resolve(__dirname, "../data/counciltrack_store.json");
  fs.writeFileSync(storePath, JSON.stringify(cleanStore, null, 2), "utf8");
  console.log("✓ Successfully reset counciltrack_store.json with clean data!");
  console.log(`Total Councils: ${councils.length}`);
  console.log(`Total Users (1 Admin + 14 Council Accounts): ${users.length}`);
  console.log("Mock goals, reflections, feedback, and old discord logs completely cleared.");
}

seedClean().catch(console.error);
