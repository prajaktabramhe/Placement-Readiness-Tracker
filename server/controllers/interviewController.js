const Interview = require("../models/Interview");
const Application = require("../models/Application");

// Schedule a new interview round (Mentor/Admin only)
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, round, date, type } = req.body;

    if (!applicationId || !round || !date) {
      return res.status(400).json({ success: false, message: "Application ID, round name, and date are required" });
    }

    // Verify application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const interview = await Interview.create({
      application: applicationId,
      student: application.student,
      job: application.job,
      round,
      date,
      type: type || "Technical",
      result: "Pending",
    });

    // Update application status & timeline automatically
    application.status = "Interview Scheduled";
    application.timeline.push({
      status: "Interview Scheduled",
      notes: `Scheduled ${round} (${type}) for ${new Date(date).toLocaleString()}.`,
    });
    await application.save();

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      interview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all interviews (Mentor/Admin view)
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("student", "name email preferredRole")
      .populate({
        path: "job",
        populate: { path: "company" },
      })
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current student's interviews
const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ student: req.user.id })
      .populate({
        path: "job",
        populate: { path: "company" },
      })
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record Interview score and feedback (Mentor/Admin only)
const updateInterviewResult = async (req, res) => {
  try {
    const { score, feedback, result } = req.body;
    const interviewId = req.params.id;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (score !== undefined) interview.score = score;
    if (feedback !== undefined) interview.feedback = feedback;
    if (result !== undefined) interview.result = result;

    await interview.save();

    // Optionally update application timeline based on result
    const application = await Application.findById(interview.application);
    if (application) {
      let timelineStatus = "Interview Completed";
      let timelineNotes = `Completed ${interview.round} with result: ${result}.`;
      if (score !== undefined) {
        timelineNotes += ` Score: ${score}/10.`;
      }
      if (feedback) {
        timelineNotes += ` Feedback: ${feedback}`;
      }

      application.status = "Interview Completed";
      application.timeline.push({
        status: timelineStatus,
        notes: timelineNotes,
      });

      // Automatically change application status if student clears/fails overall
      if (result === "Selected") {
        application.status = "Shortlisted";
      } else if (result === "Rejected") {
        application.status = "Rejected";
      }

      await application.save();
    }

    res.status(200).json({
      success: true,
      message: "Interview result updated successfully",
      interview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  getMyInterviews,
  updateInterviewResult,
};
