const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    education: {
      degree: { type: String, default: "" },
      branch: { type: String, default: "" },
      gpa: { type: Number, default: null },
      graduationYear: { type: Number, default: null },
    },
    skills: [
      {
        name: { type: String, required: true },
        category: {
          type: String,
          enum: [
            "Frontend",
            "Backend",
            "Database",
            "Problem Solving",
            "Communication",
            "Resume Readiness",
            "Interview Readiness",
          ],
          required: true,
        },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Placement Ready"],
          default: "Beginner",
        },
      },
    ],
    resume: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    preferredRole: {
      type: String,
      default: "",
    },
    readinessStatus: {
      type: String,
      enum: ["Ready", "Not Ready"],
      default: "Not Ready",
    },
    readinessScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);