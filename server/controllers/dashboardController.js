const Company = require("../models/companyModel");

const getDashboardStats = async (req, res) => {
  try {
    const companies = await Company.find({
      user: req.user.id,
    });

    const stats = {
      totalApplications: companies.length,
      applied: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    };

    companies.forEach((company) => {
      switch (company.status) {
        case "Applied":
          stats.applied++;
          break;

        case "Interview":
          stats.interview++;
          break;

        case "Selected":
          stats.selected++;
          break;

        case "Rejected":
          stats.rejected++;
          break;

        default:
          break;
      }
    });

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};