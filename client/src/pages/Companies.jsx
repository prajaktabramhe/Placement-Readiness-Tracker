import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

const Companies = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "student";

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hiringStatusFilter, setHiringStatusFilter] = useState("All");

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [hiringStatus, setHiringStatus] = useState("Hiring");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await API.get("/company");
      if (response.data.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load company directory");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.warning("Company name is required");
    }

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        website: website.trim(),
        location: location.trim(),
        hiringStatus,
      };

      if (editingCompany) {
        const response = await API.put(`/company/${editingCompany._id}`, payload);
        if (response.data.success) {
          toast.success("Company profile updated successfully!");
          fetchCompanies();
          closeFormModal();
        }
      } else {
        const response = await API.post("/company", payload);
        if (response.data.success) {
          toast.success("New company profile added!");
          fetchCompanies();
          closeFormModal();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEditClick = (company) => {
    setEditingCompany(company);
    setName(company.name || "");
    setDescription(company.description || "");
    setWebsite(company.website || "");
    setLocation(company.location || "");
    setHiringStatus(company.hiringStatus || "Hiring");
    setShowFormModal(true);
  };

  const handleDeleteClick = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company? All active job postings linked to it will also be affected.")) return;

    try {
      const response = await API.delete(`/company/${companyId}`);
      if (response.data.success) {
        toast.success("Company profile removed from registry");
        fetchCompanies();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingCompany(null);
    setName("");
    setDescription("");
    setWebsite("");
    setLocation("");
    setHiringStatus("Hiring");
  };

  // Filter list
  const filteredCompanies = companies.filter((c) => {
    const searchString = search.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(searchString);
    const descMatch = c.description?.toLowerCase().includes(searchString);
    const locMatch = c.location?.toLowerCase().includes(searchString);
    
    const matchesSearch = nameMatch || descMatch || locMatch;
    const matchesStatus = hiringStatusFilter === "All" || c.hiringStatus === hiringStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight font-sans">Company Registry</h1>
          <p className="text-gray-500 mt-2">Manage hiring profiles of registered recruiters and target companies.</p>
        </div>
        {role !== "student" && (
          <button
            onClick={() => setShowFormModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 transform hover:-translate-y-0.5 cursor-pointer font-sans"
          >
            + Register Recruiter
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="🔍 Search company name, profile, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2 p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />

        <select
          value={hiringStatusFilter}
          onChange={(e) => setHiringStatusFilter(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="All">All Hiring Statuses</option>
          <option value="Hiring">Hiring</option>
          <option value="Not Hiring">Not Hiring</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Grid of Companies */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 text-center">
          <span className="text-4xl">🏢</span>
          <h3 className="font-bold text-gray-800 text-xl mt-3">No companies registered</h3>
          <p className="text-gray-400 text-sm mt-1">Try modifying your filters or register a new company profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{company.name}</h3>
                    <div className="flex gap-2 items-center text-xs text-gray-400 mt-1">
                      <span>📍 {company.location || "Location Not Listed"}</span>
                      {company.website && (
                        <>
                          <span>•</span>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            Website link
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                      company.hiringStatus === "Hiring"
                        ? "bg-green-50 border-green-200 text-green-600"
                        : company.hiringStatus === "On Hold"
                        ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                        : "bg-red-50 border-red-200 text-red-600"
                    }`}
                  >
                    {company.hiringStatus}
                  </span>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                  {company.description || "No company summary profile provided."}
                </p>
              </div>

              {role !== "student" && (
                <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-50 justify-end">
                  <button
                    onClick={() => handleEditClick(company)}
                    className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    ✏️ Edit profile
                  </button>
                  <button
                    onClick={() => handleDeleteClick(company._id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CRUD Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingCompany ? "✏️ Edit Recruiter Details" : "🏢 Register Recruiter Profile"}
            </h2>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google, Microsoft"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Hiring Status</label>
                  <select
                    value={hiringStatus}
                    onChange={(e) => setHiringStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  >
                    <option value="Hiring">Hiring</option>
                    <option value="Not Hiring">Not Hiring</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Website Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://google.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Recruiter summary profile</label>
                <textarea
                  placeholder="Describe company operations, product verticals, or hiring targets..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Recruiter Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
