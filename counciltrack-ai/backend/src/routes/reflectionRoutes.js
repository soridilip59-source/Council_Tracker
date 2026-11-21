const express = require("express");
const { submitReflection, getReflections, getReflectionById } = require("../controllers/reflectionController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

// Students are strictly excluded
router.post("/", authorize("super_admin", "admin", "council_member"), submitReflection);
router.get("/", authorize("super_admin", "admin", "council_member"), getReflections);
router.get("/:id", authorize("super_admin", "admin", "council_member"), getReflectionById);

module.exports = router;
