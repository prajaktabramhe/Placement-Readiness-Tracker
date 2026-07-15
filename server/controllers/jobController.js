const Job = require("../models/Job");
const Company = require("../models/companyModel");

// Create Job (Admin/Mentor only)
const addJob = async (req, res) => {
  try {
    const {
      title,
      companyId,
      location,
      workMode,
      jobType,
      requiredSkills,
      salaryRange,
      eligibilityCriteria,
      deadline,
      status,
      description,
    } = req.body;

    if (!title || !companyId) {
      return res.status(400).json({ success: false, message: "Job title and Company ID are required" });
    }

    const job = await Job.create({
      title,
      company: companyId,
      location,
      workMode,
      jobType,
      requiredSkills,
      salaryRange,
      eligibilityCriteria,
      deadline,
      status,
      description,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Job opening created successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Jobs (with Search & Filter)
const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      workMode,
      jobType,
      status,
      skills,
    } = req.query;

    let query = {};

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (workMode && workMode !== "All") {
      query.workMode = workMode;
    }

    if (jobType && jobType !== "All") {
      query.jobType = jobType;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (skills) {
      // Find jobs matching skills
      const skillArray = skills.split(",").map(s => s.trim());
      query.requiredSkills = { $in: skillArray };
    }

    const jobs = await Job.find(query).populate("company").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Job Details
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("company");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Job (Admin/Mentor only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Map companyId to company field if present in body
    const updateData = { ...req.body };
    if (updateData.companyId) {
      updateData.company = updateData.companyId;
      delete updateData.companyId;
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("company");

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Job (Admin/Mentor only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
