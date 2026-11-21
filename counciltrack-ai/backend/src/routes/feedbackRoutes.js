const express = require("express");
const { submitFeedback, getFeedback, getFeedbackById } = require("../controllers/feedbackController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", submitFeedback);
router.get("/", getFeedback);
router.get("/:id", getFeedbackById);

module.exports = router;
