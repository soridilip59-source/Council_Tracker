const cron = require("node-cron");
const sheetsService = require("../services/sheetsService");
const aiService = require("../services/aiService");

function initMonthlyReportJob() {
  // Runs on the 1st day of every month at 00:05 AM IST
  cron.schedule("5 0 1 * *", async () => {
    console.log("[MonthlyReportJob] Running automated monthly AI performance batch...");
    try {
      const now = new Date();
      // Previous month
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);

      const councilMembers = await sheetsService.find("Users", (u) => u.role === "council_member" && u.status === "active");
      for (const member of councilMembers) {
        // Check if report already exists
        const existing = await sheetsService.findOne("AI_Reports", (r) => r.userId === member.userId && r.month === prevMonthStr);
        if (!existing) {
          console.log(`[MonthlyReportJob] Generating draft evaluation for ${member.name} (${prevMonthStr})...`);
          await aiService.generateMonthlyReport(member.userId, prevMonthStr);
        }
      }
    } catch (err) {
      console.error("[MonthlyReportJob] Error in monthly report job:", err.message);
    }
  }, {
    timezone: process.env.TZ || "Asia/Kolkata",
  });

  console.log("[Jobs] Monthly AI report cron job initialized (Asia/Kolkata)");
}

module.exports = { initMonthlyReportJob };
