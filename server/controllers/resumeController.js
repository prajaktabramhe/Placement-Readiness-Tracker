const Company = require("../models/companyModel");

const uploadResume = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF",
      });
    }

    company.resume = req.file.filename;

    await company.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: company.resume,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  uploadResume,
};