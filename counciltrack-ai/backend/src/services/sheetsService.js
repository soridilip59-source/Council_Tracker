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
  Reflections: ["reflectionId", "userId", "councilId", "reflectionDate", "achievements", "incompleteGoals", "challenges", "learnings", "improvements", "submittedAt", "updatedAt"],
  Weekly_Goals: ["weeklyGoalId", "councilId", "userId", "weekStart", "weekEnd", "title", "description", "status", "createdAt", "updatedAt"],
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
    ],
    Councils: [],
    Goals: [],
    Reflections: [],
    Weekly_Goals: [],
    Student_Feedback: [],
    Goal_History: [],
    Audit_Logs: [],
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

  async getAll(sheetName, forceRefresh = false) {
    if (!this.lastFetchTime) this.lastFetchTime = {};
    const now = Date.now();
    const lastFetch = this.lastFetchTime[sheetName] || 0;

    // Auto-refresh from Google Sheets if configured and cache is older than 15 seconds
    if (isConfigured() && (forceRefresh || now - lastFetch > 15000)) {
      this.lastFetchTime[sheetName] = now;
      await this.fetchFromGoogleSheets(sheetName);
    }

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
