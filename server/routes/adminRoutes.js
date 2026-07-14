const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
console.log("CHECK:", {
  authMiddleware,
  adminMiddleware,
  getAllUsers,
  updateUserRole,
  deleteUser,
});
// Get all users
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);
console.log({
  getAllUsers,
  updateUserRole,
  deleteUser,
});

// Update role
router.put(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  updateUserRole
);

// Delete user
router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

module.exports = router;