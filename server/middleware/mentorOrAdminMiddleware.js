const User = require("../models/User");

const mentorOrAdminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "mentor" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Mentors and Admins only.",
      });
    }

    req.fullUser = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = mentorOrAdminMiddleware;
