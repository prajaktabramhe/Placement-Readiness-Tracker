import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

const Jobs = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "student";

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  
  // Search / Filter
  const [search, setSearch] = useState("");
  const [workMode, setWorkMode] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // CRUD Form Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobWorkMode, setJobWorkMode] = useState("Remote");
  const [jobJobType, setJobJobType] = useState("Full-Time");
  const [jobRequiredSkills, setJobRequiredSkills] = useState("");
  const [jobSalaryRange, setJobSalaryRange] = useState("");
  const [jobEligibility, setJobEligibility] = useState("");
  const [jobDeadline, setJobDeadline] = useState("");
  const [jobStatus, setJobStatus] = useState("Active");
  const [jobDescription, setJobDescription] = useState("");

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyingJob, setApplyingJob] = useState(null);
  const [studentRemarks, setStudentRemarks] = useState("");

  // Student's submitted application job IDs
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Load companies list (for CRUD select)
      const compRes = await API.get("/company");
      if (compRes.data.success) {
        setCompanies(compRes.data.companies);
      }

      // Load student profile & applications (if student)
      if (role === "student") {
        const profileRes = await API.get("/users/me");
        if (profileRes.data.success) {
          setStudentProfile(profileRes.data.user);
        }

        const appRes = await API.get("/applications/my");
        if (appRes.data.success) {
          const ids = new Set(appRes.data.applications.map((app) => app.job?._id));
          setAppliedJobIds(ids);
        }
      }

      await fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to load platform data");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await API.get("/jobs");
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch jobs");
    }
  };

  // Create or Update Job
  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!jobTitle || !selectedCompanyId) {
      return toast.warning("Job title and Company are required");
    }

    try {
      const skillsArray = jobRequiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      const payload = {
        title: jobTitle,
        companyId: selectedCompanyId,
        location: jobLocation,
        workMode: jobWorkMode,
        jobType: jobJobType,
        requiredSkills: skillsArray,
        salaryRange: jobSalaryRange,
        eligibilityCriteria: jobEligibility,
        deadline: jobDeadline || null,
        status: jobStatus,
        description: jobDescription,
      };

      if (editingJob) {
        const response = await API.put(`/jobs/${editingJob._id}`, payload);
        if (response.data.success) {
          toast.success("Job details updated successfully!");
          fetchJobs();
          closeFormModal();
        }
      } else {
        const response = await API.post("/jobs", payload);
        if (response.data.success) {
          toast.success("New job opening published!");
          fetchJobs();
          closeFormModal();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save job opening");
    }
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setJobTitle(job.title || "");
    setSelectedCompanyId(job.company?._id || "");
    setJobLocation(job.location || "");
    setJobWorkMode(job.workMode || "Remote");
    setJobJobType(job.jobType || "Full-Time");
    setJobRequiredSkills(job.requiredSkills?.join(", ") || "");
    setJobSalaryRange(job.salaryRange || "");
    setJobEligibility(job.eligibilityCriteria || "");
    setJobDeadline(job.deadline ? job.deadline.split("T")[0] : "");
    setJobStatus(job.status || "Active");
    setJobDescription(job.description || "");
    setShowFormModal(true);
  };

  const handleDeleteClick = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job opening? This will fail if student applications are linked.")) return;

    try {
      const response = await API.delete(`/jobs/${jobId}`);
      if (response.data.success) {
        toast.success("Job opening deleted successfully");
        fetchJobs();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingJob(null);
    setJobTitle("");
    setSelectedCompanyId("");
    setJobLocation("");
    setJobWorkMode("Remote");
    setJobJobType("Full-Time");
    setJobRequiredSkills("");
    setJobSalaryRange("");
    setJobEligibility("");
    setJobDeadline("");
    setJobStatus("Active");
    setJobDescription("");
  };

  // Submit Job Application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyingJob) return;

    try {
      const response = await API.post("/applications", {
        jobId: applyingJob._id,
        studentRemarks,
      });

      if (response.data.success) {
        toast.success("Applied successfully!");
        setAppliedJobIds(new Set([...appliedJobIds, applyingJob._id]));
        setShowApplyModal(false);
        setStudentRemarks("");
        setApplyingJob(null);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to apply to this job");
    }
  };

  // Compute matching eligibility and missing skills
  const checkSkillGaps = (requiredSkills) => {
    if (!studentProfile || !requiredSkills || requiredSkills.length === 0) return { gaps: [], matchRate: 100 };
    
    const studentSkills = new Set(
      (studentProfile.skills || []).map((s) => s.name.toLowerCase())
    );

    const gaps = requiredSkills.filter(
      (skill) => !studentSkills.has(skill.toLowerCase())
    );

    const matchRate = Math.round(
      ((requiredSkills.length - gaps.length) / requiredSkills.length) * 100
    );

    return { gaps, matchRate };
  };

  // Filter Jobs List
  const filteredJobs = jobs.filter((job) => {
    const searchString = search.toLowerCase();
    const titleMatch = job.title?.toLowerCase().includes(searchString);
    const companyMatch = job.company?.name?.toLowerCase().includes(searchString);
    const skillMatch = job.requiredSkills?.some((s) => s.toLowerCase().includes(searchString));
    const locationMatch = job.location?.toLowerCase().includes(searchString);

    const matchesSearch = titleMatch || companyMatch || skillMatch || locationMatch;
    const matchesMode = workMode === "All" || job.workMode === workMode;
    const matchesType = jobType === "All" || job.jobType === jobType;
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;

    return matchesSearch && matchesMode && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Job Board & Openings</h1>
          <p className="text-gray-500 mt-2">Explore available job listings and check preparation qualifications.</p>
        </div>
        {role !== "student" && (
          <button
            onClick={() => setShowFormModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition duration-200 transform hover:-translate-y-0.5 cursor-pointer"
          >
            + Publish New Job
          </button>
        )}
      </div>

      {/* Filter Options Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="🔍 Search title, company, skills, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-1 p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />

        <select
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <option value="All">All Work Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>

        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <option value="All">All Job Types</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Jobs List Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <span className="text-4xl">💼</span>
          <h3 className="font-bold text-gray-800 text-xl mt-3">No jobs found</h3>
          <p className="text-gray-400 text-sm mt-1">Try modifying your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => {
            const { gaps, matchRate } = checkSkillGaps(job.requiredSkills);
            const isApplied = appliedJobIds.has(job._id);

            return (
              <div
                key={job._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 hover:shadow-xl transition duration-300 space-y-6"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{job.title}</h2>
                    <div className="flex gap-4 items-center text-sm text-gray-500 mt-1 flex-wrap">
                      <span className="font-semibold text-amber-600">🏢 {job.company?.name}</span>
                      <span>📍 {job.location || "Location Not Specified"}</span>
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {job.workMode}
                      </span>
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                        {job.jobType}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase border ${
                        job.status === "Active"
                          ? "bg-green-50 border-green-200 text-green-600"
                          : job.status === "On Hold"
                          ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                          : "bg-red-50 border-red-200 text-red-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase">Job Description</h4>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed whitespace-pre-line">
                        {job.description || "No description provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase">Salary / Stipend Range</h4>
                        <p className="text-gray-800 text-sm font-semibold mt-0.5">
                          💰 {job.salaryRange || "Competitive"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase">Eligibility Criteria</h4>
                        <p className="text-gray-800 text-sm font-semibold mt-0.5">
                          🎓 {job.eligibilityCriteria || "All branches eligible"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Requirements & Gap Analyzer */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Required Skills</h4>
                      <div className="flex gap-1.5 flex-wrap">
                        {job.requiredSkills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {role === "student" && (
                      <div className="pt-3 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-500">SKILLS MATCH</span>
                          <span className={`font-extrabold ${matchRate >= 75 ? "text-green-600" : "text-yellow-600"}`}>
                            {matchRate}%
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${matchRate >= 75 ? "bg-green-500" : "bg-yellow-500"}`}
                            style={{ width: `${matchRate}%` }}
                          ></div>
                        </div>

                        {gaps.length > 0 ? (
                          <div>
                            <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">Missing Skills:</span>
                            <div className="flex gap-1 flex-wrap">
                              {gaps.map((g, idx) => (
                                <span key={idx} className="bg-red-50 border border-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-green-600 font-extrabold flex items-center gap-1">
                            ✓ Fully eligible! All skills match.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-50 flex-wrap gap-4">
                  <div className="text-xs text-gray-400">
                    📅 Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No Deadline"}
                  </div>

                  <div className="flex gap-3">
                    {role === "student" ? (
                      isApplied ? (
                        <button
                          disabled
                          className="px-6 py-2.5 bg-green-50 border border-green-200 text-green-600 font-bold rounded-xl text-sm"
                        >
                          ✓ Already Applied
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setApplyingJob(job);
                            setShowApplyModal(true);
                          }}
                          disabled={job.status !== "Active"}
                          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-600/10 cursor-pointer"
                        >
                          {job.status === "Active" ? "Apply to Job" : "Inactive"}
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(job)}
                          className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          ✏️ Edit Opening
                        </button>
                        <button
                          onClick={() => handleDeleteClick(job._id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CRUD Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingJob ? "✏️ Edit Job Opening" : "➕ Publish New Job Opening"}
            </h2>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Company</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, Bangalore"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Work Mode</label>
                  <select
                    value={jobWorkMode}
                    onChange={(e) => setJobWorkMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Job Type</label>
                  <select
                    value={jobJobType}
                    onChange={(e) => setJobJobType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 - 12 LPA"
                    value={jobSalaryRange}
                    onChange={(e) => setJobSalaryRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Eligibility Criteria</label>
                  <input
                    type="text"
                    placeholder="e.g. CGPA >= 8.0, B.Tech CSE"
                    value={jobEligibility}
                    onChange={(e) => setJobEligibility(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, JavaScript, MongoDB"
                  value={jobRequiredSkills}
                  onChange={(e) => setJobRequiredSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Application Deadline</label>
                  <input
                    type="date"
                    value={jobDeadline}
                    onChange={(e) => setJobDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Status</label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Job Description</label>
                <textarea
                  placeholder="Describe roles, responsibilities, and qualifications..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
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
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Job Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Submit Application</h2>
            <p className="text-gray-500 text-sm mb-4">
              Applying for <span className="font-bold text-amber-600">{applyingJob?.title}</span> at <span className="font-bold text-gray-800">{applyingJob?.company?.name}</span>.
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Cover Note / Remarks</label>
                <textarea
                  placeholder="Introduce yourself or add notes for reviewers..."
                  value={studentRemarks}
                  onChange={(e) => setStudentRemarks(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none resize-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplyingJob(null);
                    setStudentRemarks("");
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm cursor-pointer"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;

