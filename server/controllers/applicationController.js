const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

// Apply to a Job (Student only)
const applyToJob = async (req, res) => {
  try {
    const { jobId, studentRemarks } = req.body;
    const studentId = req.user.id;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    // Verify job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job opening not found" });
    }
    if (job.status !== "Active") {
      return res.status(400).json({ success: false, message: "This job opening is no longer active" });
    }

    // Check for existing application
    const existing = await Application.findOne({ student: studentId, job: jobId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already applied for this job" });
    }

    const application = await Application.create({
      student: studentId,
      job: jobId,
      status: "Applied",
      studentRemarks,
      timeline: [
        {
          status: "Applied",
          notes: studentRemarks || "Application submitted by student.",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current student's applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate({
        path: "job",
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all applications (Mentor/Admin view) with filters
const getApplications = async (req, res) => {
  try {
    const { studentName, companyName, jobRole, status } = req.query;

    let query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    // Populate and filter
    const applications = await Application.find(query)
      .populate({
        path: "student",
        select: "name email preferredRole readinessScore",
      })
      .populate({
        path: "job",
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    // Filter results programmatically based on search queries
    let filtered = applications;

    if (studentName) {
      filtered = filtered.filter((app) =>
        app.student?.name?.toLowerCase().includes(studentName.toLowerCase())
      );
    }

    if (companyName) {
      filtered = filtered.filter((app) =>
        app.job?.company?.name?.toLowerCase().includes(companyName.toLowerCase())
      );
    }

    if (jobRole) {
      filtered = filtered.filter((app) =>
        app.job?.title?.toLowerCase().includes(jobRole.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      applications: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Application Details
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: "student",
        select: "name email phone resume linkedin github preferredRole education readinessScore readinessStatus skills",
      })
      .populate({
        path: "job",
        populate: { path: "company" },
      });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Application Status & Timeline (Mentor/Admin only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes, finalResult, mentorNotes } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (status) {
      application.status = status;
      application.timeline.push({
        status,
        notes: notes || `Status updated to ${status} by mentor/admin.`,
        date: new Date(),
      });
    }

    if (finalResult !== undefined) application.finalResult = finalResult;
    if (mentorNotes !== undefined) application.mentorNotes = mentorNotes;

    await application.save();

    const updated = await Application.findById(req.params.id)
      .populate("student", "name email")
      .populate({
        path: "job",
        populate: { path: "company" },
      });

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Withdraw Application (Student only)
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Security check: only the student who applied can withdraw
    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to withdraw this application" });
    }

    application.status = "Withdrawn";
    application.timeline.push({
      status: "Withdrawn",
      notes: "Application withdrawn by student.",
      date: new Date(),
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
};
