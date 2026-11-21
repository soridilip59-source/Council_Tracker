const cron = require("node-cron");
const discordService = require("../services/discordService");
const { channels } = require("../config/discord");

function initDailyReminderJob() {
  // Morning goal setting prompt (8:00 AM IST)
  cron.schedule("0 8 * * *", async () => {
    console.log("[DailyReminderJob] Running 8:00 AM IST daily goal reminder...");
    if (channels.goals.url) {
      await discordService.logNotification(
        "daily_reminder",
        channels.goals.name,
        "Good morning council members! Please set your daily goals on CouncilTrack AI.",
        "Sent"
      );
    }
  }, {
    timezone: process.env.TZ || "Asia/Kolkata",
  });

  // Evening reflection prompt (8:00 PM IST)
  cron.schedule("0 20 * * *", async () => {
    console.log("[DailyReminderJob] Running 8:00 PM IST evening reflection reminder...");
    if (channels.goals.url) {
      await discordService.logNotification(
        "reflection_reminder",
        channels.goals.name,
        "Good evening council members! Please complete your daily evening reflection on CouncilTrack AI.",
        "Sent"
      );
    }
  }, {
    timezone: process.env.TZ || "Asia/Kolkata",
  });

  console.log("[Jobs] Daily reminder cron jobs initialized (Asia/Kolkata)");
}

module.exports = { initDailyReminderJob };
