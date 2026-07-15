const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const mentorOrAdminMiddleware = require("../middleware/mentorOrAdminMiddleware");

const {
  addCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

// Public (within authenticated platform) view routes
router.get("/", authMiddleware, getCompanies);
router.get("/:id", authMiddleware, getCompanyById);

// Admin/Mentor management routes
router.post("/", authMiddleware, mentorOrAdminMiddleware, addCompany);
router.put("/:id", authMiddleware, mentorOrAdminMiddleware, updateCompany);
router.delete("/:id", authMiddleware, mentorOrAdminMiddleware, deleteCompany);

module.exports = router;