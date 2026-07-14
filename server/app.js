const express = require("express");
const cors = require("cors");

const app = express();
const path = require("path");
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.json());
// Routes
const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Default Route
app.get("/", (req, res) => {
  res.send("Placement Readiness Tracker API Running");
});

module.exports = app;