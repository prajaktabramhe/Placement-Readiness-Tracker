const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Assessment Scheduled",
        "Assessment Completed",
        "Interview Scheduled",
        "Interview Completed",
        "Offer Received",
        "Rejected",
        "Withdrawn",
      ],
      default: "Applied",
    },
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    studentRemarks: {
      type: String,
      trim: true,
    },
    mentorNotes: {
      type: String,
      trim: true,
    },
    finalResult: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Application || mongoose.model("Application", applicationSchema);
