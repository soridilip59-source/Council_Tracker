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

// Council member & DISCO submit evening reflection
router.post("/", authorize("COUNCIL", "DISCO"), validate(submitReflectionSchema), submitReflection);

// Council member & DISCO view own reflections
router.get("/my", authorize("COUNCIL", "DISCO"), getMyReflections);

// Admin & DISCO view all reflections
router.get("/", authorize("ADMIN", "DISCO"), getAllReflections);

// View reflection details
router.get("/:id", getReflectionById);

module.exports = router;
