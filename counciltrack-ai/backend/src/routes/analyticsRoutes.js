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

// Admin & DISCO dashboard summary overview
router.get("/dashboard", authorize("ADMIN", "DISCO"), getDashboardSummary);

// AI Smart Alerts — underperforming members (Admin & DISCO)
router.get("/smart-alerts", authorize("ADMIN", "DISCO"), getSmartAlerts);

// Weekly progress calculation (Admin / DISCO / Council)
router.get("/weekly", getWeeklyProgress);

// Monthly progress calculation (Admin / DISCO / Council)
router.get("/monthly", getMonthlyProgress);

// Council-wise comparison (Admin & DISCO)
router.get("/councils", authorize("ADMIN", "DISCO"), getCouncilsComparison);

// Individual member progress analytics (Admin / Own Member)
router.get("/members/:id", getMemberAnalytics);

module.exports = router;
