const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

// Add Company
router.post("/", authMiddleware, addCompany);
// Get All Companies
router.get("/", authMiddleware, getCompanies);
router.put("/:id", authMiddleware, updateCompany);
router.delete("/:id", authMiddleware, deleteCompany);
module.exports = router;