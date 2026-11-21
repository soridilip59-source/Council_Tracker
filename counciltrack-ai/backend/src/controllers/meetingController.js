const sheetsService = require("../services/sheetsService");
const discordService = require("../services/discordService");
const { generateId } = require("../utils/generateId");
const { emitSocketEvent } = require("../utils/socketEmitter");
const { successResponse, errorResponse } = require("../utils/responseHandler");

async function scheduleMeeting(req, res, next) {
  try {
    const { title, description, councilId, meetingDate, meetingTime } = req.body;

    if (!title?.trim() || !meetingDate || !meetingTime) {
      return errorResponse(res, "Title, meetingDate (YYYY-MM-DD), and meetingTime (HH:mm) are required", 400);
    }

    const newMeeting = {
      meetingId: generateId("mtg"),
      title: title.trim(),
      description: description?.trim() || "",
      councilId: councilId || "",
      meetingDate,
      meetingTime,
      discordStatus: "pending",
      createdBy: req.user.userId,
    };

    await sheetsService.insert("Meetings", newMeeting);

    // Get Council Name for Discord embed
    let councilName = "All Councils";
    if (councilId) {
      const council = await sheetsService.getById("Councils", "councilId", councilId);
      if (council) councilName = council.councilName;
    }

    // Trigger Discord notification
    discordService.notifyMeetingScheduled(newMeeting, councilName)
      .then((res) => {
        sheetsService.update("Meetings", "meetingId", newMeeting.meetingId, {
          discordStatus: res.success ? "sent" : "pending",
        });
      })
      .catch((err) => console.error(err));

    emitSocketEvent("meeting:scheduled", { meeting: newMeeting, councilName });

    return successResponse(res, { ...newMeeting, councilName }, "Meeting scheduled successfully", 201);
  } catch (err) {
    next(err);
  }
}

async function getMeetings(req, res, next) {
  try {
    const meetings = await sheetsService.getAll("Meetings");
    const councils = await sheetsService.getAll("Councils");
    const users = await sheetsService.getAll("Users");

    const enriched = meetings.map((m) => {
      const council = councils.find((c) => c.councilId === m.councilId);
      const creator = users.find((u) => u.userId === m.createdBy);
      return {
        ...m,
        councilName: council?.councilName || "All Councils",
        creatorName: creator?.name || "Administrator",
      };
    });

    // Sort by meeting date and time
    enriched.sort((a, b) => new Date(`${a.meetingDate}T${a.meetingTime}`) - new Date(`${b.meetingDate}T${b.meetingTime}`));

    return successResponse(res, enriched, "Meetings retrieved successfully");
  } catch (err) {
    next(err);
  }
}

async function updateMeeting(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, councilId, meetingDate, meetingTime } = req.body;

    const existing = await sheetsService.getById("Meetings", "meetingId", id);
    if (!existing) {
      return errorResponse(res, "Meeting not found", 404);
    }

    const updates = {};
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (councilId !== undefined) updates.councilId = councilId;
    if (meetingDate) updates.meetingDate = meetingDate;
    if (meetingTime) updates.meetingTime = meetingTime;

    const updated = await sheetsService.update("Meetings", "meetingId", id, updates);
    return successResponse(res, updated, "Meeting updated successfully");
  } catch (err) {
    next(err);
  }
}

async function cancelMeeting(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await sheetsService.getById("Meetings", "meetingId", id);
    if (!existing) {
      return errorResponse(res, "Meeting not found", 404);
    }

    await sheetsService.delete("Meetings", "meetingId", id);
    return successResponse(res, null, "Meeting cancelled successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  scheduleMeeting,
  getMeetings,
  updateMeeting,
  cancelMeeting,
};
