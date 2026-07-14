const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    jobLink: {
      type: String,
      trim: true,
    },

    applicationDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Applied", "Interview", "Selected", "Rejected"],
      default: "Applied",
    },

    notes: {
      type: String,
      trim: true,
    },

    // Resume file name
    resume: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);