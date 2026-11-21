const fs = require("fs");
const path = require("path");
const { getSheetsClient, isConfigured, getSheetId } = require("../config/googleSheets");
const { generateId } = require("../utils/generateId");

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "counciltrack_store.json");

const SHEET_HEADERS = {
  Users: ["userId", "name", "email", "passwordHash", "role", "councilId", "status", "createdAt"],
  Councils: ["councilId", "councilName", "description", "memberIds", "status", "createdAt"],
  Goals: ["goalId", "userId", "councilId", "goalType", "title", "description", "priority", "startDate", "dueDate", "status", "createdAt"],
  Progress: ["progressId", "goalId", "userId", "percentage", "status", "updateNote", "updatedAt"],
  Reflections: ["reflectionId", "userId", "periodType", "periodStart", "periodEnd", "achievements", "challenges", "learnings", "nextSteps", "submittedAt"],
  Student_Feedback: ["feedbackId", "studentId", "councilId", "month", "category", "rating", "comments", "suggestions", "submittedAt"],
  Meetings: ["meetingId", "title", "description", "councilId", "meetingDate", "meetingTime", "discordStatus", "createdBy"],
  AI_Reports: ["reportId", "userId", "month", "overallScore", "goalScore", "consistencyScore", "reflectionScore", "feedbackScore", "improvementScore", "strengths", "weaknesses", "recommendations", "status", "generatedAt"],
  Notifications: ["notificationId", "eventType", "recipientChannel", "message", "status", "retryCount", "createdAt", "sentAt"],
};

const DEFAULT_HASH = "$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW."; // Admin@123

function getInitialData() {
  const now = new Date().toISOString();
  return {
    Users: [
      {
        userId: "usr_superadmin",
        name: "Super Administrator",
        email: "superadmin@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "super_admin",
        councilId: "",
        status: "active",
        createdAt: now,
      },
      {
        userId: "usr_admin_1",
        name: "Academic Admin",
        email: "admin@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "admin",
        councilId: "cnl_disco",
        status: "active",
        createdAt: now,
      },
      {
        userId: "usr_council_1",
        name: "Rahul Sharma",
        email: "rahul@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "council_member",
        councilId: "cnl_disco",
        status: "active",
        createdAt: now,
      },
      {
        userId: "usr_council_2",
        name: "Priya Patel",
        email: "priya@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "council_member",
        councilId: "cnl_english",
        status: "active",
        createdAt: now,
      },
      {
        userId: "usr_student_1",
        name: "Aman Verma",
        email: "student@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "student",
        councilId: "",
        status: "active",
        createdAt: now,
      },
    ],
    Councils: [
      {
        councilId: "cnl_disco",
        councilName: "Discipline Council",
        description: "Promoting campus decorum, student safety, and cooperative living standards.",
        memberIds: JSON.stringify(["usr_council_1"]),
        status: "active",
        createdAt: now,
      },
      {
        councilId: "cnl_english",
        councilName: "English Facilitation Council",
        description: "Cultivating English fluency, conversational clubs, and presentation skills across all students.",
        memberIds: JSON.stringify(["usr_council_2"]),
        status: "active",
        createdAt: now,
      },
      {
        councilId: "cnl_tech",
        councilName: "Tech & Coding Council",
        description: "Supporting peer code reviews, open-source workshops, and technical hackathons.",
        memberIds: JSON.stringify([]),
        status: "active",
        createdAt: now,
      },
    ],
    Goals: [
      {
        goalId: "gol_daily_1",
        userId: "usr_council_1",
        councilId: "cnl_disco",
        goalType: "daily",
        title: "Morning Assembly & Cleanliness Inspection",
        description: "Ensure morning assembly starts punctually at 8:30 AM and dormitory zones adhere to cleanliness guidelines.",
        priority: "High",
        startDate: "2026-11-21",
        dueDate: "2026-11-21",
        status: "In Progress",
        createdAt: now,
      },
      {
        goalId: "gol_weekly_1",
        userId: "usr_council_1",
        councilId: "cnl_disco",
        goalType: "weekly",
        title: "Revamp Study Hall Peer Attendance System",
        description: "Transition paper logs to automated daily tracking across all cohorts.",
        priority: "Medium",
        startDate: "2026-11-17",
        dueDate: "2026-11-23",
        status: "In Progress",
        createdAt: now,
      },
      {
        goalId: "gol_daily_2",
        userId: "usr_council_2",
        councilId: "cnl_english",
        goalType: "daily",
        title: "Conduct 45-min Group Speaking Circle",
        description: "Moderate peer discussion topic on modern AI ethics with SOP batch.",
        priority: "High",
        startDate: "2026-11-21",
        dueDate: "2026-11-21",
        status: "Completed",
        createdAt: now,
      },
    ],
    Progress: [
      {
        progressId: "prg_1",
        goalId: "gol_daily_1",
        userId: "usr_council_1",
        percentage: 60,
        status: "In Progress",
        updateNote: "Completed morning assembly check. 94% on-time attendance recorded. Dorm inspection ongoing.",
        updatedAt: now,
      },
      {
        progressId: "prg_2",
        goalId: "gol_daily_2",
        userId: "usr_council_2",
        percentage: 100,
        status: "Completed",
        updateNote: "Speaking circle concluded with 28 participants actively sharing viewpoints.",
        updatedAt: now,
      },
    ],
    Reflections: [
      {
        reflectionId: "ref_1",
        userId: "usr_council_1",
        periodType: "daily",
        periodStart: "2026-11-20",
        periodEnd: "2026-11-20",
        achievements: "Conducted dormitory orientation for new learners.",
        challenges: "Some students arrived late due to project deadlines.",
        learnings: "Need to coordinate schedule with programming lead.",
        nextSteps: "Send reminder announcement 15 minutes in advance.",
        submittedAt: now,
      },
      {
        reflectionId: "ref_2",
        userId: "usr_council_2",
        periodType: "weekly",
        periodStart: "2026-11-14",
        periodEnd: "2026-11-20",
        achievements: "Completed 5 daily speaking circles and 1 vocabulary contest.",
        challenges: "Learner hesitation in large auditorium settings.",
        learnings: "Smaller breakout groups of 4-5 increase participation drastically.",
        nextSteps: "Adopt micro-circles format for next week's sessions.",
        submittedAt: now,
      },
    ],
    Student_Feedback: [
      {
        feedbackId: "fdb_1",
        studentId: "usr_student_1",
        councilId: "cnl_english",
        month: "2026-11",
        category: "Engagement",
        rating: 5,
        comments: "The morning conversation circles boosted my confidence significantly!",
        suggestions: "Please organize more mock interview practice sessions.",
        submittedAt: now,
      },
      {
        feedbackId: "fdb_2",
        studentId: "usr_student_1",
        councilId: "cnl_disco",
        month: "2026-11",
        category: "Support",
        rating: 4,
        comments: "Discipline council has been fair and supportive.",
        suggestions: "Clarify study room silence hours during weekend exam periods.",
        submittedAt: now,
      },
    ],
    Meetings: [
      {
        meetingId: "mtg_1",
        title: "All-Council Monthly Review & Alignment",
        description: "Monthly coordination meeting to review council objectives, cross-council initiatives, and AI performance reports.",
        councilId: "cnl_disco",
        meetingDate: "2026-11-28",
        meetingTime: "17:00",
        discordStatus: "sent",
        createdBy: "usr_admin_1",
      },
    ],
    AI_Reports: [],
    Notifications: [],
  };
}

class SheetsService {
  constructor() {
    this.localData = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_PATH)) {
      try {
        const raw = fs.readFileSync(STORE_PATH, "utf8");
        this.localData = JSON.parse(raw);
      } catch (err) {
        console.warn("[SheetsService] Failed to parse local store, reinitializing defaults:", err.message);
        this.localData = getInitialData();
        this.persistLocal();
      }
    } else {
      this.localData = getInitialData();
      this.persistLocal();
    }
  }

  persistLocal() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.localData, null, 2), "utf8");
    } catch (err) {
      console.error("[SheetsService] Error writing to local store:", err.message);
    }
  }

  // --- External Google Sheets Sync Layer ---
  async syncToGoogleSheets(sheetName) {
    if (!isConfigured()) return;
    try {
      const sheets = getSheetsClient();
      const spreadsheetId = getSheetId();
      const rows = this.localData[sheetName] || [];
      const headers = SHEET_HEADERS[sheetName];
      if (!headers) return;

      const values = [headers];
      for (const row of rows) {
        values.push(headers.map((h) => (row[h] !== undefined && row[h] !== null ? String(row[h]) : "")));
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values },
      });
      console.log(`[Google Sheets] Synced ${values.length} rows for worksheet: ${sheetName}`);
    } catch (err) {
      console.error(`[Google Sheets] Sync error on ${sheetName}:`, err.message);
    }
  }

  // --- CRUD API ---

  async getAll(sheetName) {
    if (!this.localData[sheetName]) {
      this.localData[sheetName] = [];
    }
    return [...this.localData[sheetName]];
  }

  async find(sheetName, filterFn) {
    const all = await this.getAll(sheetName);
    return all.filter(filterFn);
  }

  async findOne(sheetName, filterFn) {
    const all = await this.getAll(sheetName);
    return all.find(filterFn) || null;
  }

  async getById(sheetName, idField, idValue) {
    return this.findOne(sheetName, (item) => String(item[idField]) === String(idValue));
  }

  async insert(sheetName, record) {
    if (!this.localData[sheetName]) {
      this.localData[sheetName] = [];
    }
    const cleanRecord = { ...record };
    this.localData[sheetName].push(cleanRecord);
    this.persistLocal();
    // Non-blocking sync to Google Sheets if configured
    this.syncToGoogleSheets(sheetName).catch((err) => console.error(err));
    return cleanRecord;
  }

  async update(sheetName, idField, idValue, updates) {
    if (!this.localData[sheetName]) return null;
    const index = this.localData[sheetName].findIndex((item) => String(item[idField]) === String(idValue));
    if (index === -1) return null;

    this.localData[sheetName][index] = {
      ...this.localData[sheetName][index],
      ...updates,
    };
    this.persistLocal();
    this.syncToGoogleSheets(sheetName).catch((err) => console.error(err));
    return this.localData[sheetName][index];
  }

  async delete(sheetName, idField, idValue) {
    if (!this.localData[sheetName]) return false;
    const initialLen = this.localData[sheetName].length;
    this.localData[sheetName] = this.localData[sheetName].filter((item) => String(item[idField]) !== String(idValue));
    if (this.localData[sheetName].length !== initialLen) {
      this.persistLocal();
      this.syncToGoogleSheets(sheetName).catch((err) => console.error(err));
      return true;
    }
    return false;
  }
}

const sheetsService = new SheetsService();
module.exports = sheetsService;
