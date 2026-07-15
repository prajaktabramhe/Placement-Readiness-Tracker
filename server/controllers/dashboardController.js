const User = require("../models/User");
const Company = require("../models/companyModel");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === "student") {
      // ======================================
      // Student Dashboard Stats
      // ======================================
      const student = await User.findById(userId);
      if (!student) {
        return res.status(404).json({ success: false, message: "Student profile not found" });
      }

      // Applications
      const applications = await Application.find({ student: userId }).populate({
        path: "job",
        populate: { path: "company" },
      });

      // Upcoming Interviews
      const upcomingInterviews = await Interview.find({
        student: userId,
        date: { $gte: new Date() },
      })
        .populate({
          path: "job",
          populate: { path: "company" },
        })
        .sort({ date: 1 })
        .limit(5);

      // Application status breakdown
      const statusCounts = {
        Applied: 0,
        Shortlisted: 0,
        "Assessment Scheduled": 0,
        "Assessment Completed": 0,
        "Interview Scheduled": 0,
        "Interview Completed": 0,
        "Offer Received": 0,
        Rejected: 0,
        Withdrawn: 0,
      };

      applications.forEach((app) => {
        if (statusCounts[app.status] !== undefined) {
          statusCounts[app.status]++;
        }
      });

      // Applications over time (last 6 months)
      const monthlyApplications = {};
      applications.forEach((app) => {
        const date = new Date(app.createdAt);
        const monthYear = date.toLocaleString("default", { month: "short", year: "2-digit" });
        monthlyApplications[monthYear] = (monthlyApplications[monthYear] || 0) + 1;
      });

      const timelineData = Object.keys(monthlyApplications).map((month) => ({
        month,
        count: monthlyApplications[month],
      })).slice(-6);

      // Skill proficiency counts
      const skillCounts = {
        Beginner: 0,
        Intermediate: 0,
        Advanced: 0,
        "Placement Ready": 0,
      };
      student.skills.forEach((s) => {
        if (skillCounts[s.level] !== undefined) {
          skillCounts[s.level]++;
        }
      });

      // Target role gap: compare student skills with active jobs of preferred role
      let missingSkills = [];
      if (student.preferredRole) {
        const targetJobs = await Job.find({
          title: { $regex: student.preferredRole, $options: "i" },
          status: "Active",
        });

        const jobRequiredSkills = new Set();
        targetJobs.forEach((job) => {
          job.requiredSkills.forEach((skill) => {
            jobRequiredSkills.add(skill.toLowerCase());
          });
        });

        const studentSkills = new Set(student.skills.map((s) => s.name.toLowerCase()));
        missingSkills = Array.from(jobRequiredSkills).filter((skill) => !studentSkills.has(skill));
      }

      return res.status(200).json({
        success: true,
        role: "student",
        stats: {
          readinessScore: student.readinessScore,
          readinessStatus: student.readinessStatus,
          totalApplications: applications.length,
          statusCounts,
          upcomingInterviews,
          skillCounts,
          missingSkills: missingSkills.slice(0, 6),
          applicationsTimeline: timelineData,
        },
      });
    } else if (userRole === "mentor") {
      // ======================================
      // Mentor Dashboard Stats
      // ======================================
      const totalStudents = await User.countDocuments({ role: "student" });
      const readyCount = await User.countDocuments({ role: "student", readinessStatus: "Ready" });
      const notReadyCount = totalStudents - readyCount;

      // Upcoming interviews this week
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      const interviewsThisWeek = await Interview.find({
        date: { $gte: new Date(), $lte: oneWeekFromNow },
      })
        .populate("student", "name email")
        .populate({
          path: "job",
          populate: { path: "company" },
        });

      // Applications breakdown
      const allApps = await Application.find().populate({
        path: "job",
        populate: { path: "company" },
      });

      const statusCounts = {
        Applied: 0,
        Shortlisted: 0,
        "Offer Received": 0,
        Rejected: 0,
      };
      const companyProgress = {};

      allApps.forEach((app) => {
        // Broad breakdown
        if (statusCounts[app.status] !== undefined) {
          statusCounts[app.status]++;
        } else if (["Interview Scheduled", "Interview Completed", "Assessment Scheduled", "Assessment Completed"].includes(app.status)) {
          statusCounts["Shortlisted"]++;
        }

        // Company counts
        const compName = app.job?.company?.name || "Unknown";
        companyProgress[compName] = (companyProgress[compName] || 0) + 1;
      });

      // Low readiness students (< 50)
      const lowReadiness = await User.find({ role: "student", readinessScore: { $lt: 50 } })
        .select("name email readinessScore preferredRole")
        .sort({ readinessScore: 1 })
        .limit(5);

      // Top missing skills aggregates (mocked from common missing skills or aggregated from all job requirements)
      const allJobs = await Job.find({ status: "Active" });
      const skillFrequencies = {};
      allJobs.forEach((job) => {
        job.requiredSkills.forEach((s) => {
          const name = s.trim().toLowerCase();
          skillFrequencies[name] = (skillFrequencies[name] || 0) + 1;
        });
      });

      const topGaps = Object.keys(skillFrequencies)
        .map((name) => ({ skill: name, count: skillFrequencies[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return res.status(200).json({
        success: true,
        role: "mentor",
        stats: {
          totalStudents,
          readyCount,
          notReadyCount,
          interviewsThisWeekCount: interviewsThisWeek.length,
          interviewsThisWeek,
          statusCounts,
          lowReadiness,
          topGaps,
          companyProgress: Object.keys(companyProgress).map((comp) => ({
            company: comp,
            count: companyProgress[comp],
          })),
        },
      });
    } else if (userRole === "admin") {
      // ======================================
      // Admin Dashboard Stats
      // ======================================
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalMentors = await User.countDocuments({ role: "mentor" });
      const totalCompanies = await Company.countDocuments();
      const totalJobs = await Job.countDocuments();
      const activeJobs = await Job.countDocuments({ status: "Active" });

      const allApps = await Application.find();
      const offersReceived = allApps.filter((a) => a.status === "Offer Received").length;
      const placementRate = totalStudents > 0 ? ((offersReceived / totalStudents) * 100).toFixed(1) : 0;

      // Role distribution
      const roleDistribution = {
        Student: totalStudents,
        Mentor: totalMentors,
        Admin: await User.countDocuments({ role: "admin" }),
      };

      // Monthly Application Trends (last 6 months)
      const monthlyTrends = {};
      allApps.forEach((app) => {
        const date = new Date(app.createdAt);
        const monthYear = date.toLocaleString("default", { month: "short", year: "2-digit" });
        monthlyTrends[monthYear] = (monthlyTrends[monthYear] || 0) + 1;
      });

      const trendsData = Object.keys(monthlyTrends).map((month) => ({
        month,
        count: monthlyTrends[month],
      })).slice(-6);

      // Jobs by company count
      const companyJobs = await Job.aggregate([
        { $group: { _id: "$company", count: { $sum: 1 } } },
      ]);
      const populatedCompanyJobs = await Company.populate(companyJobs, { path: "_id", select: "name" });
      const companyJobCounts = populatedCompanyJobs.map((c) => ({
        company: c._id?.name || "Unknown",
        count: c.count,
      })).slice(0, 6);

      // Outcomes breakdown
      const outcomeBreakdown = {
        Placed: offersReceived,
        Rejected: allApps.filter((a) => a.status === "Rejected").length,
        InProcess: allApps.filter((a) => !["Offer Received", "Rejected", "Withdrawn"].includes(a.status)).length,
      };

      return res.status(200).json({
        success: true,
        role: "admin",
        stats: {
          totalUsers,
          totalStudents,
          totalMentors,
          totalCompanies,
          totalJobs,
          activeJobs,
          closedJobs: totalJobs - activeJobs,
          placementRate,
          roleDistribution,
          monthlyTrends: trendsData,
          companyJobCounts,
          outcomeBreakdown,
        },
      });
    }

    res.status(400).json({ success: false, message: "Invalid user role" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};