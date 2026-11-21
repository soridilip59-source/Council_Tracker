const { channels } = require("../config/discord");
const sheetsService = require("./sheetsService");
const { generateId } = require("../utils/generateId");

async function sendWebhook(webhookUrl, payload, maxRetries = 2) {
  if (!webhookUrl) {
    return { success: false, reason: "No webhook URL configured (skipped in dev mode)" };
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return { success: true };
      }

      // Handle Discord rate limit (429)
      if (response.status === 429) {
        const rateLimitData = await response.json().catch(() => ({}));
        const retryAfter = (rateLimitData.retry_after || 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
      } else {
        const errText = await response.text().catch(() => "");
        console.warn(`[Discord Webhook] Attempt ${attempt + 1} failed: ${response.status} ${errText}`);
      }
    } catch (error) {
      console.warn(`[Discord Webhook] Network error on attempt ${attempt + 1}: ${error.message}`);
    }
    attempt++;
    if (attempt <= maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  return { success: false, reason: "Max retries exceeded" };
}

class DiscordService {
  async logNotification(eventType, recipientChannel, message, status, retryCount = 0) {
    const record = {
      notificationId: generateId("notif"),
      eventType,
      recipientChannel,
      message: typeof message === "string" ? message : JSON.stringify(message),
      status,
      retryCount,
      createdAt: new Date().toISOString(),
      sentAt: status === "Sent" ? new Date().toISOString() : "",
    };
    await sheetsService.insert("Notifications", record);
    return record;
  }

  // Event 1: New Goal Created -> #council-goals
  async notifyGoalCreated(goal, user, council) {
    const channel = channels.goals;
    const embed = {
      title: `🎯 New ${goal.goalType === "daily" ? "Daily" : "Weekly"} Goal Established`,
      description: `**${goal.title}**\n${goal.description || "No description provided."}`,
      color: 0x22c55e, // Green
      fields: [
        { name: "Council", value: council?.councilName || "General Council", inline: true },
        { name: "Owner", value: user?.name || "Council Member", inline: true },
        { name: "Priority", value: goal.priority || "Medium", inline: true },
        { name: "Due Date", value: goal.dueDate || "Not set", inline: true },
      ],
      footer: { text: "CouncilTrack AI • Automated Notification" },
      timestamp: new Date().toISOString(),
    };

    const res = await sendWebhook(channel.url, {
      username: "CouncilTrack AI",
      embeds: [embed],
    });

    await this.logNotification("goal_created", channel.name, goal.title, res.success ? "Sent" : "Pending");
    return res;
  }

  // Event 2: Goal Completed -> #goal-completions
  async notifyGoalCompleted(goal, user, council) {
    const channel = channels.completions;
    const embed = {
      title: `🎉 Goal Completed!`,
      description: `**${goal.title}** has been marked as 100% completed.`,
      color: 0x3b82f6, // Blue
      fields: [
        { name: "Council", value: council?.councilName || "General Council", inline: true },
        { name: "Completed By", value: user?.name || "Council Member", inline: true },
        { name: "Goal Type", value: goal.goalType === "daily" ? "Daily Goal" : "Weekly Goal", inline: true },
      ],
      footer: { text: "CouncilTrack AI • Automated Notification" },
      timestamp: new Date().toISOString(),
    };

    const res = await sendWebhook(channel.url, {
      username: "CouncilTrack AI",
      embeds: [embed],
    });

    await this.logNotification("goal_completed", channel.name, goal.title, res.success ? "Sent" : "Pending");
    return res;
  }

  // Event 3: Weekly Reflection Approved Summary -> #weekly-reflections
  async notifyWeeklyReflectionSummary(summaryText, councilName) {
    const channel = channels.reflections;
    const embed = {
      title: `📋 Weekly Council Progress Summary`,
      description: summaryText,
      color: 0xa855f7, // Purple
      fields: [
        { name: "Council", value: councilName, inline: true },
        { name: "Reporting Week", value: new Date().toISOString().slice(0, 10), inline: true },
      ],
      footer: { text: "CouncilTrack AI • Public Reflection Summary" },
      timestamp: new Date().toISOString(),
    };

    const res = await sendWebhook(channel.url, {
      username: "CouncilTrack AI",
      embeds: [embed],
    });

    await this.logNotification("weekly_reflection", channel.name, summaryText.slice(0, 120), res.success ? "Sent" : "Pending");
    return res;
  }

  // Event 4: Meeting Scheduled -> #meetings
  async notifyMeetingScheduled(meeting, councilName) {
    const channel = channels.meetings;
    const embed = {
      title: `📅 New Meeting Scheduled: ${meeting.title}`,
      description: meeting.description || "Coordination meeting for council members.",
      color: 0xf59e0b, // Amber
      fields: [
        { name: "Council", value: councilName || "All Councils", inline: true },
        { name: "Date", value: meeting.meetingDate, inline: true },
        { name: "Time", value: meeting.meetingTime, inline: true },
      ],
      footer: { text: "CouncilTrack AI • Meeting Coordinator" },
      timestamp: new Date().toISOString(),
    };

    const res = await sendWebhook(channel.url, {
      username: "CouncilTrack AI",
      embeds: [embed],
    });

    await this.logNotification("meeting_scheduled", channel.name, meeting.title, res.success ? "Sent" : "Pending");
    return res;
  }

  // Event 5: Meeting Reminder -> #meetings
  async notifyMeetingReminder(meeting, councilName, reminderType = "1 hour") {
    const channel = channels.meetings;
    const embed = {
      title: `⏰ Reminder: Upcoming Meeting in ${reminderType}`,
      description: `**${meeting.title}** is starting soon.\n${meeting.description || ""}`,
      color: 0xef4444, // Red
      fields: [
        { name: "Council", value: councilName || "All Councils", inline: true },
        { name: "Meeting Time", value: `${meeting.meetingDate} at ${meeting.meetingTime}`, inline: true },
      ],
      footer: { text: "CouncilTrack AI • Meeting Reminder" },
      timestamp: new Date().toISOString(),
    };

    const res = await sendWebhook(channel.url, {
      username: "CouncilTrack AI",
      embeds: [embed],
    });

    await this.logNotification("meeting_reminder", channel.name, meeting.title, res.success ? "Sent" : "Pending");
    return res;
  }

  // Event 6: Approved Performance Summary -> #council-performance
  async notifyApprovedPerformance(report, userName, councilName) {
    const channel = channels.performance;
    const embed = {
      title: `🏆 Monthly Performance Evaluation Finalized`,
      description: `Approved monthly evaluation results for **${userName}** (${councilName}).`,
      color: 0x10b981, // Emerald
      fields: [
        { name: "Reporting Month", value: report.month, inline: true },
        { name: "Overall Score", value: `${report.overallScore} / 100`, inline: true },
        { name: "Goal Achievement", value: `${report.goalScore}%`, inline: true },
        { name: "Consistency", value: `${report.consistencyScore}%`, inline: true },
      ],
      footer: { text: "CouncilTrack AI • Performance Analysis" },
      timestamp: new Date().toISOString(),
    };

    const res = await sendWebhook(channel.url, {
      username: "CouncilTrack AI",
      embeds: [embed],
    });

    await this.logNotification("performance_approved", channel.name, `Report ${report.reportId}`, res.success ? "Sent" : "Pending");
    return res;
  }
}

module.exports = new DiscordService();
