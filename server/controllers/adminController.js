const User = require("../models/User");


// ==========================
// Get All Users
// ==========================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ==========================
// Update User Role
// ==========================
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      user,
    });


  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ==========================
// Delete User
// ==========================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });


  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ==========================
// Export Controllers
// ==========================
module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
};