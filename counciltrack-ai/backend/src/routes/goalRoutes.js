const express = require("express");
const {
  createGoal,
  getMyGoals,
  getAllGoals,
  getGoalById,
  updateGoal,
  updateGoalStatus,
  suggestGoals,
  broadcastGoalsToDiscord,
} = require("../controllers/goalController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { createGoalSchema, updateGoalStatusSchema } = require("../validators");

const router = express.Router();

// Broadcast all goals to Discord (can be triggered by Admin or authenticated users)
router.post("/broadcast-discord", broadcastGoalsToDiscord);

router.use(authenticate);

// AI Goal Suggestions (Council & DISCO)
router.get("/suggestions", authorize("COUNCIL", "DISCO"), suggestGoals);

// Create or assign daily goal (Council, DISCO, or Admin)
router.post("/", authorize("COUNCIL", "DISCO", "ADMIN"), validate(createGoalSchema), createGoal);

// Council member & DISCO view own goals
router.get("/my", authorize("COUNCIL", "DISCO"), getMyGoals);

// Admin & DISCO view all goals (DISCO monitors all council goals)
router.get("/", authorize("ADMIN", "DISCO"), getAllGoals);

// Details of a specific goal
router.get("/:id", getGoalById);

// Update own goal information
router.patch("/:id", updateGoal);

// Update goal status (Completed / Incomplete / Pending)
router.patch("/:id/status", validate(updateGoalStatusSchema), updateGoalStatus);

module.exports = router;
