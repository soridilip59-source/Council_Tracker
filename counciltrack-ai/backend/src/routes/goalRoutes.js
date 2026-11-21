const express = require("express");
const { createGoal, getGoals, getGoalById, updateGoal, deleteGoal } = require("../controllers/goalController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

// Students can only view goals; super_admin, admin, council_member can create/update
router.post("/", authorize("super_admin", "admin", "council_member"), createGoal);
router.get("/", getGoals);
router.get("/:id", getGoalById);
router.put("/:id", authorize("super_admin", "admin", "council_member"), updateGoal);
router.delete("/:id", authorize("super_admin", "admin", "council_member"), deleteGoal);

module.exports = router;
