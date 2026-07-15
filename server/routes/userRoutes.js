const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const mentorOrAdminMiddleware = require("../middleware/mentorOrAdminMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  updateMySkills,
  getStudentById,
  getAllStudents,
} = require("../controllers/userController");

// Student/Self profile routes
router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);
router.put("/me/skills", authMiddleware, updateMySkills);

// Mentor/Admin routes to view students
router.get("/students", authMiddleware, mentorOrAdminMiddleware, getAllStudents);
router.get("/students/:id", authMiddleware, mentorOrAdminMiddleware, getStudentById);

module.exports = router;
