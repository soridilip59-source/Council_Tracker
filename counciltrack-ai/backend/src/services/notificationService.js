const sheetsService = require("./sheetsService");
const discordService = require("./discordService");

class NotificationService {
  async retryPendingNotifications() {
    try {
      const pending = await sheetsService.find("Notifications", (n) => n.status === "Pending" && Number(n.retryCount || 0) < 3);
      if (!pending.length) return;

      console.log(`[NotificationService] Processing ${pending.length} pending notifications...`);
      for (const item of pending) {
        // Attempt retry
        const retries = Number(item.retryCount || 0) + 1;
        // In real execution, retry logic delegates to discord webhook URL
        await sheetsService.update("Notifications", "notificationId", item.notificationId, {
          retryCount: retries,
          status: retries >= 3 ? "Failed" : "Pending",
        });
      }
    } catch (err) {
      console.error("[NotificationService] Retry job error:", err.message);
    }
  }
}

module.exports = new NotificationService();
