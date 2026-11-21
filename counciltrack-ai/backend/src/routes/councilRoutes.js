const express = require("express");
const { createCouncil, getCouncils, getCouncilById, updateCouncil } = require("../controllers/councilController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("super_admin", "admin"), createCouncil);
router.get("/", getCouncils);
router.get("/:id", getCouncilById);
router.put("/:id", authorize("super_admin", "admin"), updateCouncil);

module.exports = router;
