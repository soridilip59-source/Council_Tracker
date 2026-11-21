const cron = require("node-cron");
const sheetsService = require("../services/sheetsService");
const discordService = require("../services/discordService");

function initMeetingReminderJob() {
  // Check every 15 minutes for meetings in the upcoming hour
  cron.schedule("*/15 * * * *", async () => {
    try {
      const meetings = await sheetsService.getAll("Meetings");
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      const todayMeetings = meetings.filter((m) => m.meetingDate === todayStr);
      for (const meeting of todayMeetings) {
        const meetingDateTime = new Date(`${meeting.meetingDate}T${meeting.meetingTime}:00`);
        const diffMinutes = Math.round((meetingDateTime - now) / (1000 * 60));

        // Remind if meeting is between 45 and 60 minutes away
        if (diffMinutes > 40 && diffMinutes <= 60) {
          const council = meeting.councilId ? await sheetsService.getById("Councils", "councilId", meeting.councilId) : null;
          console.log(`[MeetingReminderJob] Sending reminder for meeting: ${meeting.title}`);
          await discordService.notifyMeetingReminder(meeting, council?.councilName, "1 hour");
        }
      }
    } catch (err) {
      console.error("[MeetingReminderJob] Error checking reminders:", err.message);
    }
  }, {
    timezone: process.env.TZ || "Asia/Kolkata",
  });

  console.log("[Jobs] Meeting reminder cron job initialized (Asia/Kolkata)");
}

module.exports = { initMeetingReminderJob };
