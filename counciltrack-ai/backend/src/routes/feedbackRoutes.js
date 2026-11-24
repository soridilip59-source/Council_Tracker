const express = require("express");
const {
  submitFeedback,
  getAllFeedback,
  getMyCouncilFeedback,
  updateFeedbackStatus,
  updateFeedbackNotes,
} = require("../controllers/feedbackController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { rateLimiter } = require("../middleware/rateLimiter");
const {
  feedbackSchema,
  updateFeedbackStatusSchema,
  updateFeedbackNotesSchema,
} = require("../validators");

const router = express.Router();

// Public feedback submission (no authentication needed; rate limited)
router.post("/", rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }), validate(feedbackSchema), submitFeedback);

// Council member views feedback for their assigned council (private notes omitted)
router.get("/my-council", authenticate, authorize("COUNCIL"), getMyCouncilFeedback);

// Admin views all feedback across all councils
router.get("/", authenticate, authorize("ADMIN"), getAllFeedback);

// Admin updates complaint status
router.patch("/:id/status", authenticate, authorize("ADMIN"), validate(updateFeedbackStatusSchema), updateFeedbackStatus);

// Admin updates private admin notes
router.patch("/:id/notes", authenticate, authorize("ADMIN"), validate(updateFeedbackNotesSchema), updateFeedbackNotes);

module.exports = router;
