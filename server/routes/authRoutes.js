const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Route
router.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to your profile!",
    user: req.user,
  });
});

module.exports = router;