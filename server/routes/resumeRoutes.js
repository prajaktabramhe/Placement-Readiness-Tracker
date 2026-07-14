const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadResume } = require("../controllers/resumeController");

router.put(
  "/:id",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

module.exports = router;