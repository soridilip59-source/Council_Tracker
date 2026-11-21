const express = require("express");
const { generateReport, getReports, getReportById, approveReport } = require("../controllers/reportController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

// Students are strictly excluded
router.post("/generate", authorize("super_admin", "admin"), generateReport);
router.get("/", authorize("super_admin", "admin", "council_member"), getReports);
router.get("/:id", authorize("super_admin", "admin", "council_member"), getReportById);
router.patch("/:id/approve", authorize("super_admin", "admin"), approveReport);

module.exports = router;
