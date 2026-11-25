const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { getSheetsClient, isConfigured, getSheetId } = require("../src/config/googleSheets");
const sheetsService = require("../src/services/sheetsService");

const SHEET_HEADERS = {
  Users: ["userId", "name", "email", "passwordHash", "role", "councilId", "position", "status", "createdAt", "updatedAt"],
  Councils: ["councilId", "councilName", "description", "status", "createdAt", "updatedAt"],
  Goals: ["goalId", "userId", "councilId", "title", "description", "expectedOutcome", "priority", "goalDate", "status", "incompleteReason", "createdAt", "updatedAt"],
  Reflections: ["reflectionId", "userId", "councilId", "reflectionDate", "achievements", "incompleteGoals", "challenges", "learnings", "improvements", "submittedAt", "updatedAt"],
  Weekly_Goals: ["weeklyGoalId", "councilId", "userId", "weekStart", "weekEnd", "title", "description", "status", "createdAt", "updatedAt"],
  Student_Feedback: ["feedbackId", "studentName", "councilId", "feedbackType", "message", "contact", "status", "adminNotes", "submittedAt", "updatedAt"],
  Goal_History: ["historyId", "goalId", "userId", "oldStatus", "newStatus", "action", "changedAt"],
  Audit_Logs: ["logId", "actorId", "action", "entityType", "entityId", "details", "createdAt"],
  Council_Leaves: ["leaveId", "userId", "memberName", "councilId", "startDate", "endDate", "totalDays", "reason", "handoverStudentName", "status", "createdAt"],
  Settings: ["settingKey", "settingValue", "description", "updatedAt"],
};

async function setupGoogleSheet() {
  console.log("==================================================");
  console.log("   CouncilTrack AI — Google Sheets Auto-Setup");
  console.log("==================================================");

  if (!isConfigured()) {
    console.error("❌ Google Sheets is NOT configured yet.");
    console.log("Please check:");
    console.log("1. GOOGLE_SHEET_ID is set in backend/.env");
    console.log("2. Service account key file placed at: backend/credentials/service_account.json");
    process.exit(1);
  }

  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();

  try {
    // 1. Get existing sheets
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const existingTitles = (meta.data.sheets || []).map((s) => s.properties.title);
    console.log("Current worksheets in Google Sheet:", existingTitles);

    // 2. Add missing worksheets
    const requiredSheets = Object.keys(SHEET_HEADERS);
    const requests = [];

    for (const title of requiredSheets) {
      if (!existingTitles.includes(title)) {
        requests.push({
          addSheet: {
            properties: { title },
          },
        });
      }
    }

    if (requests.length > 0) {
      console.log(`Adding ${requests.length} missing worksheet tabs...`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
      console.log("✓ All worksheets created successfully!");
    }

    // 3. Sync headers and initial data
    console.log("Syncing initial data and headers to all worksheets...");
    for (const title of requiredSheets) {
      await sheetsService.syncToGoogleSheets(title);
      console.log(`✓ Synced: ${title}`);
    }

    console.log("\n🎉 Google Sheet setup completed successfully!");
    console.log("Open your spreadsheet to view the live synchronized data.");
  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    if (err.message.includes("The caller does not have permission")) {
      console.error("\n👉 Tip: Make sure you shared the Google Sheet with your service account email as 'Editor'.");
    }
  }
}

setupGoogleSheet();
