const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const mentorOrAdminMiddleware = require("../middleware/mentorOrAdminMiddleware");

const {
  createSession,
  getSessions,
  updateSession,
  deleteSession,
} = require("../controllers/sessionController");

// General listing for logged-in users (students see theirs; mentors see theirs; admins see all)
router.get("/", authMiddleware, getSessions);

// Mentors/Admins management routes
router.post("/", authMiddleware, mentorOrAdminMiddleware, createSession);
router.put("/:id", authMiddleware, mentorOrAdminMiddleware, updateSession);
router.delete("/:id", authMiddleware, mentorOrAdminMiddleware, deleteSession);

module.exports = router;
