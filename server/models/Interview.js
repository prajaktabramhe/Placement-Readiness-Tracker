const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    round: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["Technical", "HR", "Managerial", "Coding Assessment", "Assignment"],
      default: "Technical",
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
      trim: true,
    },
    result: {
      type: String,
      enum: ["Pending", "Selected", "Rejected", "On Hold"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Interview || mongoose.model("Interview", interviewSchema);
