const express = require("express");
const {
  getDashboardSummary,
  getWeeklyProgress,
  getMonthlyProgress,
  getCouncilsComparison,
  getMemberAnalytics,
  getSmartAlerts,
} = require("../controllers/analyticsController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

// Admin dashboard summary overview
router.get("/dashboard", authorize("ADMIN"), getDashboardSummary);

// AI Smart Alerts — underperforming members (Admin only)
router.get("/smart-alerts", authorize("ADMIN"), getSmartAlerts);

// Weekly progress calculation (Admin / Council)
router.get("/weekly", getWeeklyProgress);

// Monthly progress calculation (Admin / Council)
router.get("/monthly", getMonthlyProgress);

// Council-wise comparison (Admin only)
router.get("/councils", authorize("ADMIN"), getCouncilsComparison);

// Individual member progress analytics (Admin / Own Member)
router.get("/members/:id", getMemberAnalytics);

module.exports = router;
