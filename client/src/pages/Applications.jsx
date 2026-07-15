import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

const Applications = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "student";

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  
  // Search / Filters
  const [studentSearch, setStudentSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Detail Modal & Status Update Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Status edit values
  const [newStatus, setNewStatus] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [mentorNotes, setMentorNotes] = useState("");
  const [finalResult, setFinalResult] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = role === "student" ? "/applications/my" : "/applications";
      const response = await API.get(url);
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;

    try {
      const response = await API.post(`/applications/${appId}/withdraw`);
      if (response.data.success) {
        toast.success("Application withdrawn successfully");
        fetchApplications();
        if (selectedApp && selectedApp._id === appId) {
          closeDetailModal();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to withdraw application");
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      const payload = {
        status: newStatus,
        notes: newNotes,
        mentorNotes,
        finalResult,
      };

      const response = await API.put(`/applications/${selectedApp._id}/status`, payload);
      if (response.data.success) {
        toast.success("Application updated successfully!");
        fetchApplications();
        // Update local modal data
        setSelectedApp(response.data.application);
        setShowStatusModal(false);
        setNewNotes("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const openDetailModal = async (appId) => {
    try {
      const response = await API.get(`/applications/${appId}`);
      if (response.data.success) {
        setSelectedApp(response.data.application);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load application details");
    }
  };

  const openStatusEdit = (app) => {
    setNewStatus(app.status || "");
    setMentorNotes(app.mentorNotes || "");
    setFinalResult(app.finalResult || "");
    setNewNotes("");
    setShowStatusModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedApp(null);
  };

  const statusColor = (status) => {
    switch (status) {
      case "Applied":
        return "bg-amber-50 text-blue-700 border-amber-200";
      case "Shortlisted":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Assessment Scheduled":
      case "Assessment Completed":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Interview Scheduled":
      case "Interview Completed":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Offer Received":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Filter list
  const filteredApps = applications.filter((app) => {
    const sFilter = statusFilter === "All" || app.status === statusFilter;
    const matchesRole = roleSearch === "" || app.job?.title?.toLowerCase().includes(roleSearch.toLowerCase());
    const matchesCompany = companySearch === "" || app.job?.company?.name?.toLowerCase().includes(companySearch.toLowerCase());
    
    let matchesStudent = true;
    if (role !== "student" && studentSearch !== "") {
      matchesStudent = app.student?.name?.toLowerCase().includes(studentSearch.toLowerCase());
    }

    return sFilter && matchesRole && matchesCompany && matchesStudent;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          {role === "student" ? "My Applications" : "Student Applications Tracker"}
        </h1>
        <p className="text-gray-500 mt-2">
          {role === "student"
            ? "Track the statuses, assessment deadlines, and scheduled interviews for your submissions."
            : "Review student profiles, qualifications, and update recruitment step statuses."}
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {role !== "student" && (
          <input
            type="text"
            placeholder="🔍 Search Student Name..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        )}
        <input
          type="text"
          placeholder="🔍 Search Company..."
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="🔍 Search Job Role..."
          value={roleSearch}
          onChange={(e) => setRoleSearch(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Assessment Scheduled">Assessment Scheduled</option>
          <option value="Assessment Completed">Assessment Completed</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Interview Completed">Interview Completed</option>
          <option value="Offer Received">Offer Received</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 text-center">
          <span className="text-4xl">📝</span>
          <h3 className="font-bold text-gray-800 text-xl mt-3">No applications found</h3>
          <p className="text-gray-400 text-sm mt-1">Select a different filter or submit new applications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  {role !== "student" && <th className="px-6 py-4">Student</th>}
                  <th className="px-6 py-4">Job Role</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Application Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/55 transition">
                    {role !== "student" && (
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="font-bold text-gray-800">{app.student?.name}</h4>
                          <span className="text-xs text-amber-600 font-semibold">Ready Score: {app.student?.readinessScore}%</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 font-bold text-gray-800">{app.job?.title}</td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{app.job?.company?.name}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openDetailModal(app._id)}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs cursor-pointer"
                        >
                          👁️ View
                        </button>
                        {role !== "student" && (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              openStatusEdit(app);
                            }}
                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold rounded-lg text-xs cursor-pointer"
                          >
                            ✏️ Update Status
                          </button>
                        )}
                        {role === "student" && app.status !== "Withdrawn" && (
                          <button
                            onClick={() => handleWithdraw(app._id)}
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs cursor-pointer"
                          >
                            🚪 Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
            <div className="flex justify-between items-start border-b pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Application details</h2>
                <p className="text-gray-500 text-xs mt-1">Submitted on {new Date(selectedApp.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Application Details Summary */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Target Job</span>
                    <h4 className="font-bold text-gray-800 mt-0.5">{selectedApp.job?.title}</h4>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Company</span>
                    <h4 className="font-bold text-amber-600 mt-0.5">{selectedApp.job?.company?.name}</h4>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Work Mode</span>
                    <p className="text-gray-700 font-medium text-sm mt-0.5">{selectedApp.job?.workMode} ({selectedApp.job?.jobType})</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Application Status</span>
                    <p className="mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(selectedApp.status)}`}>
                        {selectedApp.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Timeline Visual Progress */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Application Journey Timeline</h3>
                  <div className="relative border-l border-amber-100 ml-3 pl-5 space-y-5">
                    {selectedApp.timeline?.map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot */}
                        <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white ring-4 ring-amber-50"></div>
                        <div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-800">{step.status}</span>
                            <span className="text-gray-400">{new Date(step.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1 leading-relaxed">{step.notes || "No detailed logs logged."}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Student remarks</span>
                    <p className="text-gray-600 text-xs mt-1 bg-gray-50 rounded-xl p-3 border leading-relaxed">
                      {selectedApp.studentRemarks || "No student remarks submitted."}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Mentor notes</span>
                    <p className="text-gray-600 text-xs mt-1 bg-amber-50/50 rounded-xl p-3 border border-amber-100/50 leading-relaxed">
                      {selectedApp.mentorNotes || "No notes added by mentor yet."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Applicant Profile Summary (Mental/Admin view) */}
              <div className="bg-gray-50/80 rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Applicant Qualifications</h3>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold text-gray-700 text-sm">{selectedApp.student?.name}</h5>
                    <span className="text-xs text-gray-400">{selectedApp.student?.email}</span>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Education Degree</span>
                    <p className="text-gray-700 text-xs font-semibold">
                      {selectedApp.student?.education?.degree ? `${selectedApp.student.education.degree} - ${selectedApp.student.education.branch} (GPA: ${selectedApp.student.education.gpa})` : "Not listed"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Listed skills</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedApp.student?.skills?.map((s, idx) => (
                        <span key={idx} className="bg-white border text-[10px] px-2 py-0.5 rounded font-medium">
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Applicant links</span>
                    <div className="flex flex-col gap-1.5">
                      {selectedApp.student?.resume ? (
                        <a href={selectedApp.student.resume} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline text-xs font-bold">
                          📄 Open Resume Profile
                        </a>
                      ) : (
                        <span className="text-xs text-red-500 font-semibold">No resume uploaded</span>
                      )}

                      {selectedApp.student?.linkedin && (
                        <a href={selectedApp.student.linkedin} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline text-xs font-bold">
                          🔗 LinkedIn Profile
                        </a>
                      )}
                      
                      {selectedApp.student?.github && (
                        <a href={selectedApp.student.github} target="_blank" rel="noreferrer" className="text-gray-800 hover:underline text-xs font-bold">
                          🐙 GitHub Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={closeDetailModal}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm cursor-pointer"
              >
                Close View
              </button>
              {role !== "student" && (
                <button
                  onClick={() => {
                    openStatusEdit(selectedApp);
                  }}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm cursor-pointer"
                >
                  ✏️ Update Progress
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Form Modal */}
      {showStatusModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Update Application Progress</h2>
            <p className="text-gray-500 text-xs mb-4">
              Updating application for <span className="font-bold">{selectedApp.student?.name}</span>'s submission at <span className="font-bold">{selectedApp.job?.company?.name}</span>.
            </p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Application Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  required
                >
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Assessment Scheduled">Assessment Scheduled</option>
                  <option value="Assessment Completed">Assessment Completed</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interview Completed">Interview Completed</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Timeline Log Message</label>
                <input
                  type="text"
                  placeholder="e.g. Assessment scheduled for 18th July"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mentor internal Notes</label>
                <textarea
                  placeholder="Internal notes regarding interview scores, preparation levels, etc."
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Final result text</label>
                <input
                  type="text"
                  placeholder="e.g. Selected with 12 LPA package"
                  value={finalResult}
                  onChange={(e) => setFinalResult(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm cursor-pointer"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;

