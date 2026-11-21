const express = require("express");
const { scheduleMeeting, getMeetings, updateMeeting, cancelMeeting } = require("../controllers/meetingController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

// Super Admin and Admin can schedule, update, cancel; all users can view
router.post("/", authorize("super_admin", "admin"), scheduleMeeting);
router.get("/", getMeetings);
router.put("/:id", authorize("super_admin", "admin"), updateMeeting);
router.delete("/:id", authorize("super_admin", "admin"), cancelMeeting);

module.exports = router;
