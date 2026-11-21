const express = require("express");
const { login, logout, getMe } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

module.exports = router;
