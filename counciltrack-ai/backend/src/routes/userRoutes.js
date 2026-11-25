const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  promoteUserToDisco,
  demoteUserToCouncil,
  updateUserStatus,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const {
  createUserSchema,
  updateUserSchema,
  promoteDiscoSchema,
  demoteCouncilSchema,
} = require("../validators");

const router = express.Router();

router.use(authenticate);

// Staff Admin & DISCO can view users (DISCO needs roster access to assign members)
router.get("/", authorize("ADMIN", "DISCO"), getAllUsers);
router.post("/", authorize("ADMIN"), validate(createUserSchema), createUser);
router.get("/:id", getUserById);
router.patch("/:id", authorize("ADMIN"), validate(updateUserSchema), updateUser);
router.patch("/:id/status", authorize("ADMIN"), updateUserStatus);

// Role Governance: Only Staff Admin can promote a council member to DISCO or demote/reassign
router.patch("/:id/promote-disco", authorize("ADMIN"), validate(promoteDiscoSchema), promoteUserToDisco);
router.patch("/:id/demote-council", authorize("ADMIN"), validate(demoteCouncilSchema), demoteUserToCouncil);

module.exports = router;
