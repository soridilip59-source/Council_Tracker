const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { createUserSchema, updateUserSchema } = require("../validators");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), getAllUsers);
router.post("/", authorize("ADMIN"), validate(createUserSchema), createUser);
router.get("/:id", getUserById);
router.patch("/:id", validate(updateUserSchema), updateUser);
router.patch("/:id/status", authorize("ADMIN"), updateUserStatus);

module.exports = router;
