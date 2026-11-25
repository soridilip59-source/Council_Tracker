const express = require("express");
const {
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { loginSchema } = require("../validators");

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);

module.exports = router;
