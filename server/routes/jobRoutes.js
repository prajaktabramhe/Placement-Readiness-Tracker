const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const mentorOrAdminMiddleware = require("../middleware/mentorOrAdminMiddleware");

const {
  addJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

// Protected view routes
router.get("/", authMiddleware, getJobs);
router.get("/:id", authMiddleware, getJobById);

// Admin/Mentor management routes
router.post("/", authMiddleware, mentorOrAdminMiddleware, addJob);
router.put("/:id", authMiddleware, mentorOrAdminMiddleware, updateJob);
router.delete("/:id", authMiddleware, mentorOrAdminMiddleware, deleteJob);

module.exports = router;
