const express = require("express");
const { createUser, getUsers, getUserById, updateUser, updateUserStatus } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("super_admin", "admin"), createUser);
router.get("/", authorize("super_admin", "admin"), getUsers);
router.get("/:id", getUserById);
router.put("/:id", authorize("super_admin", "admin"), updateUser);
router.patch("/:id/status", authorize("super_admin", "admin"), updateUserStatus);

module.exports = router;
