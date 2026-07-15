const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const mentorOrAdminMiddleware = require("../middleware/mentorOrAdminMiddleware");

const {
  applyToJob,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} = require("../controllers/applicationController");

// Student specific routes
router.post("/", authMiddleware, applyToJob);
router.get("/my", authMiddleware, getMyApplications);
router.post("/:id/withdraw", authMiddleware, withdrawApplication);

// General view (authenticated)
router.get("/:id", authMiddleware, getApplicationById);

// Mentor/Admin tracking routes
router.get("/", authMiddleware, mentorOrAdminMiddleware, getApplications);
router.put("/:id/status", authMiddleware, mentorOrAdminMiddleware, updateApplicationStatus);

module.exports = router;
