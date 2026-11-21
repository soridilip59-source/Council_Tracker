const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

let sheetsClient = null;
let isConfigured = false;

const sheetId = process.env.GOOGLE_SHEET_ID || "";
const credPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH
  ? path.resolve(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_PATH)
  : path.resolve(process.cwd(), "credentials/service_account.json");

try {
  let auth = null;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } else if (fs.existsSync(credPath)) {
    auth = new google.auth.GoogleAuth({
      keyFile: credPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  if (auth && sheetId) {
    sheetsClient = google.sheets({ version: "v4", auth });
    isConfigured = true;
    console.log("[Google Sheets] Configured and connected to Google Sheets API.");
  } else {
    console.log("[Google Sheets] Service account credentials or GOOGLE_SHEET_ID not provided. Running in dual-mode with robust local persistent storage.");
  }
} catch (error) {
  console.warn("[Google Sheets] Initialization warning:", error.message);
  console.log("[Google Sheets] Running in dual-mode with local persistent storage fallback.");
}

module.exports = {
  getSheetsClient: () => sheetsClient,
  isConfigured: () => isConfigured,
  getSheetId: () => sheetId,
};
