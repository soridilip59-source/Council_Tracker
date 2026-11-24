const express = require("express");
const {
  submitReflection,
  getMyReflections,
  getAllReflections,
  getReflectionById,
} = require("../controllers/reflectionController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { submitReflectionSchema } = require("../validators");

const router = express.Router();

router.use(authenticate);

// Council member submits evening reflection
router.post("/", authorize("COUNCIL"), validate(submitReflectionSchema), submitReflection);

// Council member views own reflections
router.get("/my", authorize("COUNCIL"), getMyReflections);

// Admin views all reflections
router.get("/", authorize("ADMIN"), getAllReflections);

// View reflection details
router.get("/:id", getReflectionById);

module.exports = router;
