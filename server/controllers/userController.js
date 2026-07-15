const User = require("../models/User");

// Helper to calculate Placement Readiness Score (0 to 100)
const calculateReadinessScore = (user) => {
  let profilePoints = 0;

  // Profile fields: 8 fields, 5 points each (max 40 points)
  if (user.phone && user.phone.trim() !== "") profilePoints += 5;
  if (user.education && user.education.degree && user.education.degree.trim() !== "") profilePoints += 5;
  if (user.education && user.education.branch && user.education.branch.trim() !== "") profilePoints += 5;
  if (user.education && user.education.gpa && user.education.gpa > 0) profilePoints += 5;
  if (user.education && user.education.graduationYear && user.education.graduationYear > 0) profilePoints += 5;
  if (user.resume && user.resume.trim() !== "") profilePoints += 5;
  if (user.linkedin && user.linkedin.trim() !== "") profilePoints += 5;
  if (user.github && user.github.trim() !== "") profilePoints += 5;

  // Skills points (max 60 points)
  let skillPoints = 0;
  if (user.skills && user.skills.length > 0) {
    user.skills.forEach((sk) => {
      if (sk.level === "Beginner") skillPoints += 5;
      else if (sk.level === "Intermediate") skillPoints += 10;
      else if (sk.level === "Advanced") skillPoints += 15;
      else if (sk.level === "Placement Ready") skillPoints += 20;
    });
  }

  // Cap skill points at 60
  if (skillPoints > 60) {
    skillPoints = 60;
  }

  const score = profilePoints + skillPoints;
  const status = score >= 75 ? "Ready" : "Not Ready";

  return { score, status };
};

// Get current logged-in user profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ensure score is correct
    const { score, status } = calculateReadinessScore(user);
    if (user.role === "student" && (user.readinessScore !== score || user.readinessStatus !== status)) {
      user.readinessScore = score;
      user.readinessStatus = status;
      await user.save();
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile details
const updateMyProfile = async (req, res) => {
  try {
    const { phone, education, resume, linkedin, github, preferredRole } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (phone !== undefined) user.phone = phone;
    if (education !== undefined) user.education = education;
    if (resume !== undefined) user.resume = resume;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (preferredRole !== undefined) user.preferredRole = preferredRole;

    // Recalculate score
    const { score, status } = calculateReadinessScore(user);
    user.readinessScore = score;
    user.readinessStatus = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update skills array
const updateMySkills = async (req, res) => {
  try {
    const { skills } = req.body; // Array of { name, category, level }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.skills = skills;

    // Recalculate score
    const { score, status } = calculateReadinessScore(user);
    user.readinessScore = score;
    user.readinessStatus = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Skills updated successfully",
      skills: user.skills,
      readinessScore: user.readinessScore,
      readinessStatus: user.readinessStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student details by ID (Mentor/Admin view)
const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all students (for Mentors/Admins) with filters
const getAllStudents = async (req, res) => {
  try {
    const { name, preferredRole, skill, readinessStatus } = req.query;

    let query = { role: "student" };

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (preferredRole && preferredRole !== "All") {
      query.preferredRole = preferredRole;
    }

    if (readinessStatus && readinessStatus !== "All") {
      query.readinessStatus = readinessStatus;
    }

    if (skill) {
      query["skills.name"] = { $regex: skill, $options: "i" };
    }

    const students = await User.find(query).select("-password").sort({ readinessScore: -1 });

    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMySkills,
  getStudentById,
  getAllStudents,
};
