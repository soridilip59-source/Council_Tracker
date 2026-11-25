const express = require("express");
const {
  getAllCouncils,
  getCouncilById,
  createCouncil,
  updateCouncil,
  deleteCouncil,
  syncCouncils,
} = require("../controllers/councilController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { createCouncilSchema, updateCouncilSchema } = require("../validators");

const router = express.Router();

// Allow public or authenticated sync
router.post("/sync", syncCouncils);

router.use(authenticate);

router.get("/", getAllCouncils);
router.post("/", authorize("ADMIN"), validate(createCouncilSchema), createCouncil);
router.get("/:id", getCouncilById);
router.patch("/:id", authorize("ADMIN"), validate(updateCouncilSchema), updateCouncil);
router.delete("/:id", authorize("ADMIN"), deleteCouncil);

module.exports = router;
