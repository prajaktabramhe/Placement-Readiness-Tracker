import { useEffect, useState } from "react";
import CompanyForm from "../components/company/CompanyForm";
import Navbar from "../components/Navbar";
import {
  getCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
} from "../services/companyService";
import { toast } from "react-toastify";
import DeleteModal from "../components/DeleteModal";
import { uploadResume } from "../services/resumeService";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 5;

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;

    // Search
    filtered = filtered.filter((company) =>
      company.companyName.toLowerCase().includes(search.toLowerCase()),
    );

    // Status Filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((company) => company.status === statusFilter);
    }

    setFilteredCompanies(filtered);

    // Reset page whenever search/filter changes
    setCurrentPage(1);
  }, [search, statusFilter, companies]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const response = await getCompanies();

      setCompanies(response.companies);
      setFilteredCompanies(response.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (companyData) => {
    try {
      if (editingCompany) {
        await updateCompany(editingCompany._id, companyData);
        toast.success("Company updated successfully!");
      } else {
        await addCompany(companyData);
        toast.success("Company added successfully!");
      }

      setShowForm(false);
      setEditingCompany(null);

      fetchCompanies();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed!");
    }
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDeleteCompany = (company) => {
    setSelectedCompany(company);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    try {
      await deleteCompany(selectedCompany._id);

      toast.success("Company deleted successfully!");

      setDeleteModalOpen(false);
      setSelectedCompany(null);

      fetchCompanies();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed!");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-700";

      case "Interview":
        return "bg-yellow-100 text-yellow-700";

      case "Selected":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Pagination Logic
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;

  const currentCompanies = filteredCompanies.slice(
    indexOfFirstCompany,
    indexOfLastCompany,
  );

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  const handleResumeUpload = async (companyId, file) => {
    try {
      await uploadResume(companyId, file);

      toast.success("Resume uploaded successfully!");

      fetchCompanies();
    } catch (error) {
      console.error(error);

      toast.error("Resume upload failed!");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Company Management
            </h1>

            <button
              onClick={() => {
                setEditingCompany(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow"
            >
              + Add Company
            </button>
          </div>

          {/* Search + Filter */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input
              type="text"
              placeholder="🔍 Search company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Form */}

          {showForm && (
            <CompanyForm
              initialData={editingCompany}
              onSubmit={handleSaveCompany}
              onCancel={() => {
                setShowForm(false);
                setEditingCompany(null);
              }}
            />
          )}

          {/* Loading */}

          {loading ? (
            <div className="text-center text-xl font-semibold py-20">
              Loading...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">
              <h2 className="text-2xl font-semibold text-gray-700">
                No Companies Found
              </h2>
            </div>
          ) : (
            <>
              <div className="grid gap-5">
                {currentCompanies.map((company) => (
                  <div
                    key={company._id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300"
                  >
                    <div className="flex flex-col lg:flex-row justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {company.companyName}
                        </h2>

                        <p className="text-gray-600 mt-2">💼 {company.role}</p>

                        <p className="text-gray-500">📍 {company.location}</p>

                        {company.notes && (
                          <p className="mt-3 italic text-gray-500">
                            {company.notes}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 lg:mt-0">
                        <span
                          className={`px-4 py-2 rounded-full font-semibold ${statusColor(
                            company.status,
                          )}`}
                        >
                          {company.status}
                        </span>
                      </div>
                    </div>
                    {/* Resume Section */}

                    <div className="mt-5 border-t pt-4">
                      <label className="block font-semibold text-gray-700 mb-2">
                        📄 Resume
                      </label>

                      {company.resume ? (
                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                          <span className="text-green-600 font-medium">
                            {company.resume}
                          </span>

                          <a
                            href={`http://localhost:5000/uploads/${company.resume}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500 mb-3">No Resume Uploaded</p>
                      )}

                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleResumeUpload(company._id, e.target.files[0]);
                          }
                        }}
                        className="block w-full text-sm text-gray-600
      file:mr-4 file:py-2 file:px-4
      file:rounded-lg file:border-0
      file:bg-indigo-600 file:text-white
      hover:file:bg-indigo-700"
                      />
                    </div>

                    {/* Action Buttons */}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteCompany(company._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <DeleteModal
        isOpen={deleteModalOpen}
        companyName={selectedCompany?.companyName}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedCompany(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default Companies;
