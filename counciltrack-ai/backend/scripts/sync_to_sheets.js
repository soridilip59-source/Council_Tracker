const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const sheetsService = require("../src/services/sheetsService");

async function syncAll() {
  console.log("Syncing all data to Google Sheets...");
  const sheets = ["Users", "Councils", "Goals", "Reflections", "Weekly_Goals", "Student_Feedback", "Goal_History", "Audit_Logs", "Council_Leaves", "Settings"];
  for (const sheet of sheets) {
    await sheetsService.syncToGoogleSheets(sheet);
    console.log(`✓ Synced ${sheet}`);
  }
  console.log("All sheets synced!");
  process.exit(0);
}
syncAll().catch((err) => { console.error(err); process.exit(1); });
