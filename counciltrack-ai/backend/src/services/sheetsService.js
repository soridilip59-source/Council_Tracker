const fs = require("fs");
const path = require("path");
const { getSheetsClient, isConfigured, getSheetId } = require("../config/googleSheets");
const { generateId } = require("../utils/generateId");

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "../../data");
const STORE_PATH = path.join(DATA_DIR, "counciltrack_store.json");

const SHEET_HEADERS = {
  Users: ["userId", "name", "email", "passwordHash", "role", "councilId", "position", "status", "createdAt", "updatedAt"],
  Councils: ["councilId", "councilName", "description", "status", "createdAt", "updatedAt"],
  Goals: ["goalId", "userId", "councilId", "title", "description", "expectedOutcome", "priority", "goalDate", "status", "incompleteReason", "assignedTo", "assignedToName", "assignedBy", "assignedByName", "isOnLeave", "leaveStartDate", "leaveEndDate", "leaveDays", "leaveReason", "createdAt", "updatedAt"],
  Reflections: ["reflectionId", "userId", "reflectionDate", "achievements", "incompleteGoals", "challenges", "learnings", "improvements", "submittedAt", "updatedAt"],
  Student_Feedback: ["feedbackId", "studentName", "councilId", "feedbackType", "message", "contact", "status", "adminNotes", "submittedAt", "updatedAt"],
  Goal_History: ["historyId", "goalId", "userId", "oldStatus", "newStatus", "action", "changedAt"],
  Audit_Logs: ["logId", "actorId", "action", "entityType", "entityId", "details", "createdAt"],
  Council_Leaves: ["leaveId", "userId", "memberName", "councilId", "startDate", "endDate", "totalDays", "reason", "handoverStudentName", "status", "createdAt"],
  Settings: ["settingKey", "settingValue", "description", "updatedAt"],
};

// Default password: Admin@123
const DEFAULT_HASH = "$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW.";

function getInitialData() {
  const now = new Date().toISOString();
  const today = "2026-11-22";
  const yesterday = "2026-11-21";
  const twoDaysAgo = "2026-11-20";

  return {
    Users: [
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
        updatedAt: now,
      },
      {
        userId: "USR_002",
        name: "Rahul Sharma",
        email: "rahul@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "COUNCIL",
        councilId: "CNL_001",
        position: "Culture Coordinator",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "USR_003",
        name: "Priya Patel",
        email: "priya@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "COUNCIL",
        councilId: "CNL_001",
        position: "Event Coordinator",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "USR_004",
        name: "Aman Verma",
        email: "aman@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "COUNCIL",
        councilId: "CNL_001",
        position: "Student Engagement Coordinator",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "USR_005",
        name: "Neha Singh",
        email: "neha@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "COUNCIL",
        councilId: "CNL_002",
        position: "Academic Lead",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "USR_006",
        name: "Ravi Kumar",
        email: "ravi@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "COUNCIL",
        councilId: "CNL_003",
        position: "Planning Coordinator",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "USR_007",
        name: "Pooja Sharma",
        email: "pooja@counciltrack.org",
        passwordHash: DEFAULT_HASH,
        role: "COUNCIL",
        councilId: "CNL_002",
        position: "Learning Support Coordinator",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
    ],
    Councils: [
      {
        councilId: "CNL_001",
        councilName: "Culture Council",
        description: "Organizing cultural activities, campus events, festivals, and student engagement circles.",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      {
        councilId: "CNL_002",
        councilName: "Academic Council",
        description: "Monitoring learning progress, peer code reviews, study hall support, and curriculum feedback.",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      {
        councilId: "CNL_003",
        councilName: "Planning Council",
        description: "Campus logistics, weekly schedules, resources allocation, and operational reviews.",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
    ],
    Goals: [
      {
        goalId: "GL_001",
        userId: "USR_002",
        councilId: "CNL_001",
        title: "Conduct morning circle and assembly",
        description: "Coordinate with student leaders and start assembly on time with reflection theme.",
        expectedOutcome: "All houses present and engaged; positive start to the day.",
        priority: "HIGH",
        goalDate: today,
        status: "COMPLETED",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        goalId: "GL_002",
        userId: "USR_002",
        councilId: "CNL_001",
        title: "Organize cultural activity for weekend",
        description: "Finalize drama script and assign house coordinators for Sunday night program.",
        expectedOutcome: "Draft schedule ready and approved.",
        priority: "MEDIUM",
        goalDate: today,
        status: "INCOMPLETE",
        incompleteReason: "Hostel electrical maintenance delayed practice session",
        createdAt: now,
        updatedAt: now,
      },
      {
        goalId: "GL_003",
        userId: "USR_003",
        councilId: "CNL_001",
        title: "Prepare event schedule for upcoming fest",
        description: "Create minute-by-minute timeline and audio/video requirement checklist.",
        expectedOutcome: "Complete timeline sheet shared with council lead.",
        priority: "HIGH",
        goalDate: today,
        status: "COMPLETED",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        goalId: "GL_004",
        userId: "USR_004",
        councilId: "CNL_001",
        title: "Collect student suggestions from house captains",
        description: "Meet with junior cohort representatives to gather activity requests.",
        expectedOutcome: "At least 5 suggestions compiled.",
        priority: "LOW",
        goalDate: today,
        status: "PENDING",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        goalId: "GL_005",
        userId: "USR_005",
        councilId: "CNL_002",
        title: "Conduct academic peer support circle",
        description: "Help learners struggling with recursion and asynchronous JavaScript.",
        expectedOutcome: "3 learners complete their pending assignments.",
        priority: "HIGH",
        goalDate: today,
        status: "COMPLETED",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        goalId: "GL_006",
        userId: "USR_006",
        councilId: "CNL_003",
        title: "Prepare weekly campus schedule",
        description: "Coordinate with facility team for classroom cleaning and kitchen schedules.",
        expectedOutcome: "Clean sheet distributed to house captains.",
        priority: "HIGH",
        goalDate: today,
        status: "COMPLETED",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        goalId: "GL_007",
        userId: "USR_007",
        councilId: "CNL_002",
        title: "Monitor daily learning progress across cohorts",
        description: "Check GitHub PR submissions for web development students.",
        expectedOutcome: "Identify students needing 1-on-1 tutoring.",
        priority: "MEDIUM",
        goalDate: today,
        status: "PENDING",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
      // Previous days for weekly analytics
      {
        goalId: "GL_008",
        userId: "USR_002",
        councilId: "CNL_001",
        title: "Coordinate stage setup for music circle",
        description: "Arrange sound system and seating arrangements.",
        expectedOutcome: "Stage ready by 5 PM.",
        priority: "HIGH",
        goalDate: yesterday,
        status: "COMPLETED",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        goalId: "GL_009",
        userId: "USR_005",
        councilId: "CNL_002",
        title: "Verify python weekly test questions",
        description: "Review test cases and starter repository.",
        expectedOutcome: "Test repository published.",
        priority: "HIGH",
        goalDate: yesterday,
        status: "COMPLETED",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        goalId: "GL_010",
        userId: "USR_006",
        councilId: "CNL_003",
        title: "Audit study room ventilation and seating",
        description: "Inspect study hall A and B fans and chair condition.",
        expectedOutcome: "Repair list submitted.",
        priority: "MEDIUM",
        goalDate: twoDaysAgo,
        status: "COMPLETED",
        incompleteReason: "",
        createdAt: now,
        updatedAt: now,
      },
    ],
    Reflections: [
      {
        reflectionId: "REF_001",
        userId: "USR_002",
        reflectionDate: yesterday,
        achievements: "Successfully organized morning assembly and coordinated stage setup for music circle with 45 attendees.",
        incompleteGoals: "None",
        challenges: "Microphone battery drained midway; had to swap quickly.",
        learnings: "Always check spare equipment in advance.",
        improvements: "Create an audio backup kit for every event.",
        submittedAt: now,
        updatedAt: now,
      },
      {
        reflectionId: "REF_002",
        userId: "USR_005",
        reflectionDate: yesterday,
        achievements: "Reviewed python starter questions and solved questions with 12 junior students.",
        incompleteGoals: "None",
        challenges: "Students had mixed pace of comprehension.",
        learnings: "Pairing faster students with slower peers created better learning velocity.",
        improvements: "Formalize peer buddy pairings for next week.",
        submittedAt: now,
        updatedAt: now,
      },
    ],
    Student_Feedback: [
      {
        feedbackId: "FDB_001",
        studentName: "Aakash Verma",
        councilId: "CNL_001",
        feedbackType: "SUGGESTION",
        message: "Can we please organize a weekend folk music and poetry circle? Many students are interested in performing.",
        contact: "aakash.v@example.com",
        status: "UNDER_REVIEW",
        adminNotes: "Discussed with Rahul (Culture Lead) to schedule for coming Saturday.",
        submittedAt: now,
        updatedAt: now,
      },
      {
        feedbackId: "FDB_002",
        studentName: "",
        councilId: "CNL_002",
        feedbackType: "COMPLAINT",
        message: "Study room lights in Room 3 flicker constantly during late night study hours. It makes it hard to focus.",
        contact: "",
        status: "NEW",
        adminNotes: "",
        submittedAt: now,
        updatedAt: now,
      },
      {
        feedbackId: "FDB_003",
        studentName: "Sunita Netam",
        councilId: "CNL_001",
        feedbackType: "GENERAL",
        message: "The morning circles this week have been energetic and motivating. Great job to the Culture Council team!",
        contact: "sunita@example.com",
        status: "RESOLVED",
        adminNotes: "Appreciated during council sync.",
        submittedAt: now,
        updatedAt: now,
      },
    ],
    Goal_History: [
      {
        historyId: "GH_001",
        goalId: "GL_001",
        userId: "USR_002",
        oldStatus: "PENDING",
        newStatus: "COMPLETED",
        action: "Status updated during evening reflection",
        changedAt: now,
      },
      {
        historyId: "GH_002",
        goalId: "GL_002",
        userId: "USR_002",
        oldStatus: "PENDING",
        newStatus: "INCOMPLETE",
        action: "Marked incomplete due to maintenance delay",
        changedAt: now,
      },
    ],
    Audit_Logs: [
      {
        logId: "LOG_001",
        actorId: "USR_001",
        action: "COUNCIL_CREATED",
        entityType: "COUNCIL",
        entityId: "CNL_001",
        details: "Created Culture Council",
        createdAt: now,
      },
      {
        logId: "LOG_002",
        actorId: "USR_001",
        action: "MEMBER_ASSIGNED",
        entityType: "USER",
        entityId: "USR_002",
        details: "Assigned Rahul Sharma as Culture Coordinator",
        createdAt: now,
      },
    ],
    Council_Leaves: [],
    Settings: [
      {
        settingKey: "APP_NAME",
        settingValue: "CouncilTrack AI",
        description: "Official Platform Name for NavGurukul Dantewada",
        updatedAt: now,
      },
      {
        settingKey: "TIMEZONE",
        settingValue: "Asia/Kolkata",
        description: "Default Platform Timezone",
        updatedAt: now,
      },
      {
        settingKey: "FEEDBACK_ENABLED",
        settingValue: "TRUE",
        description: "Enable public feedback submission",
        updatedAt: now,
      },
      {
        settingKey: "FEEDBACK_FORM_PATH",
        settingValue: "/feedback",
        description: "Public URL route for student feedback",
        updatedAt: now,
      },
    ],
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
        // Ensure all required sheets exist
        const defaultData = getInitialData();
        let changed = false;
        for (const sheet of Object.keys(SHEET_HEADERS)) {
          if (!this.localData[sheet]) {
            this.localData[sheet] = defaultData[sheet] || [];
            changed = true;
          }
        }
        if (changed) {
          this.persistLocal();
        }
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

  // Pull latest data directly from Google Sheets into local cache
  async fetchFromGoogleSheets(sheetName) {
    if (!isConfigured()) return this.localData[sheetName] || [];
    try {
      const sheets = getSheetsClient();
      const spreadsheetId = getSheetId();
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });
      const rows = res.data.values;
      if (!rows || rows.length < 2) return [];

      const headers = rows[0];
      const parsedRows = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const item = {};
        headers.forEach((h, colIndex) => {
          item[h] = row[colIndex] !== undefined ? row[colIndex] : "";
        });
        parsedRows.push(item);
      }

      this.localData[sheetName] = parsedRows;
      this.persistLocal();
      console.log(`[Google Sheets] Pulled ${parsedRows.length} rows from Google Sheets for: ${sheetName}`);
      return parsedRows;
    } catch (err) {
      console.warn(`[Google Sheets] Error fetching from ${sheetName}:`, err.message);
      return this.localData[sheetName] || [];
    }
  }

  async syncAllFromGoogleSheets() {
    if (!isConfigured()) return;
    for (const sheetName of Object.keys(SHEET_HEADERS)) {
      await this.fetchFromGoogleSheets(sheetName);
    }
  }

  // --- Query & Mutation Methods ---

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
      updatedAt: new Date().toISOString(),
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

  async logAudit(actorId, action, entityType, entityId, details) {
    const record = {
      logId: generateId("LOG"),
      actorId,
      action,
      entityType,
      entityId,
      details: typeof details === "object" ? JSON.stringify(details) : String(details),
      createdAt: new Date().toISOString(),
    };
    await this.insert("Audit_Logs", record);
  }

  async logGoalHistory(goalId, userId, oldStatus, newStatus, action) {
    const record = {
      historyId: generateId("GH"),
      goalId,
      userId,
      oldStatus,
      newStatus,
      action,
      changedAt: new Date().toISOString(),
    };
    await this.insert("Goal_History", record);
  }
}

const sheetsService = new SheetsService();
module.exports = sheetsService;
