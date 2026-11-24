const express = require("express");
const {
  getAllCouncils,
  getCouncilById,
  createCouncil,
  updateCouncil,
} = require("../controllers/councilController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { createCouncilSchema, updateCouncilSchema } = require("../validators");

const router = express.Router();

router.use(authenticate);

router.get("/", getAllCouncils);
router.post("/", authorize("ADMIN"), validate(createCouncilSchema), createCouncil);
router.get("/:id", getCouncilById);
router.patch("/:id", authorize("ADMIN"), validate(updateCouncilSchema), updateCouncil);

module.exports = router;
