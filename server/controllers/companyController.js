const Company = require("../models/companyModel");

// Add Company
const addCompany = async (req, res) => {
  try {
    const {
      companyName,
      role,
      location,
      jobLink,
      applicationDate,
      status,
      notes,
    } = req.body;

    const company = await Company.create({
      user: req.user.id,
      companyName,
      role,
      location,
      jobLink,
      applicationDate,
      status,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Company added successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Companies
// Get All Companies (with Search & Filter)
const getCompanies = async (req, res) => {
  try {
    const { search, status } = req.query;

    let query = {
      user: req.user.id,
    };

    // Search by company name or role
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const companies = await Company.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Company
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  addCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
};
