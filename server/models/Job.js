const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "Remote",
    },
    jobType: {
      type: String,
      enum: ["Full-Time", "Internship", "Contract"],
      default: "Full-Time",
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    salaryRange: {
      type: String,
      trim: true,
    },
    eligibilityCriteria: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Closed", "On Hold"],
      default: "Active",
    },
    description: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema);
