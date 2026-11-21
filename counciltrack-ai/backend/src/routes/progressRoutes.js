const express = require("express");
const { addProgress, getProgressHistory, updateProgress } = require("../controllers/progressController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("super_admin", "admin", "council_member"), addProgress);
router.get("/:goalId", getProgressHistory);
router.put("/:id", authorize("super_admin", "admin", "council_member"), updateProgress);

module.exports = router;
