const express = require("express");
const { getActiveLeaves, getAllLeaves, createLeave } = require("../controllers/leaveController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { createLeaveSchema } = require("../validators");

const router = express.Router();

router.use(authenticate);

// Active leaves viewable by both Council and Admin
router.get("/active", getActiveLeaves);

// All leaves viewable by Admin
router.get("/", authorize("ADMIN"), getAllLeaves);

// Register a leave
router.post("/", authorize("COUNCIL", "ADMIN"), validate(createLeaveSchema), createLeave);

module.exports = router;
