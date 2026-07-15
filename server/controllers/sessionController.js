const MentorshipSession = require("../models/MentorshipSession");
const User = require("../models/User");

// Schedule a Mentorship Session (Mentor/Admin only)
const createSession = async (req, res) => {
  try {
    const { studentId, topic, date, duration, notes } = req.body;
    const mentorId = req.user.id;

    if (!studentId || !topic || !date) {
      return res.status(400).json({ success: false, message: "Student ID, topic, and date are required" });
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const session = await MentorshipSession.create({
      mentor: mentorId,
      student: studentId,
      topic,
      date,
      duration: duration ? parseInt(duration) : 30,
      notes: notes || "",
      status: "Scheduled",
    });

    const populated = await MentorshipSession.findById(session._id)
      .populate("student", "name email preferredRole")
      .populate("mentor", "name email");

    res.status(201).json({
      success: true,
      message: "Mentorship session scheduled successfully",
      session: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Sessions list (Student views their own; Mentors see sessions they lead; Admins see all)
const getSessions = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    let query = {};

    if (role === "student") {
      query.student = userId;
    } else if (role === "mentor") {
      query.mentor = userId;
    }

    const sessions = await MentorshipSession.find(query)
      .populate("student", "name email preferredRole")
      .populate("mentor", "name email")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Session details / log feedback (Mentor/Admin only)
const updateSession = async (req, res) => {
  try {
    const session = await MentorshipSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Authorization check
    if (req.user.role === "mentor" && session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to edit this session" });
    }

    const updated = await MentorshipSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("student", "name email preferredRole")
      .populate("mentor", "name email");

    res.status(200).json({
      success: true,
      message: "Session details updated successfully",
      session: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete/Cancel Session (Mentor/Admin only)
const deleteSession = async (req, res) => {
  try {
    const session = await MentorshipSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Authorization check
    if (req.user.role === "mentor" && session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to cancel this session" });
    }

    await MentorshipSession.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Mentorship session deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSession,
  getSessions,
  updateSession,
  deleteSession,
};
