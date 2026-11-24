const express = require("express");
const { login, logout, getMe } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { loginSchema } = require("../validators");

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

module.exports = router;
