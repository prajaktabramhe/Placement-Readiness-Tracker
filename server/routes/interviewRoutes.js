const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const mentorOrAdminMiddleware = require("../middleware/mentorOrAdminMiddleware");

const {
  scheduleInterview,
  getInterviews,
  getMyInterviews,
  updateInterviewResult,
} = require("../controllers/interviewController");

// Student route
router.get("/my", authMiddleware, getMyInterviews);

// Mentor/Admin routes
router.post("/", authMiddleware, mentorOrAdminMiddleware, scheduleInterview);
router.get("/", authMiddleware, mentorOrAdminMiddleware, getInterviews);
router.put("/:id", authMiddleware, mentorOrAdminMiddleware, updateInterviewResult);

module.exports = router;
