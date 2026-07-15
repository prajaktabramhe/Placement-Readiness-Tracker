import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

const Interviews = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "student";

  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [roundName, setRoundName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");

  // Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState("Pending");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await fetchInterviews();

      if (role !== "student") {
        // Load active applications for selection
        const appRes = await API.get("/applications");
        if (appRes.data.success) {
          // Filter out withdrawn, rejected, and offer received to make selection clean
          const activeApps = appRes.data.applications.filter(
            (app) => !["Withdrawn", "Rejected", "Offer Received"].includes(app.status)
          );
          setApplications(activeApps);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load interview panel data");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      const url = role === "student" ? "/interviews/my" : "/interviews";
      const response = await API.get(url);
      if (response.data.success) {
        setInterviews(response.data.interviews);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch interview rounds");
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId || !roundName || !interviewDate) {
      return toast.warning("All scheduling fields are required");
    }

    try {
      const payload = {
        applicationId: selectedAppId,
        round: roundName.trim(),
        date: interviewDate,
        type: interviewType,
      };

      const response = await API.post("/interviews", payload);
      if (response.data.success) {
        toast.success("Interview scheduled successfully!");
        fetchInterviews();
        closeScheduleModal();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to schedule interview");
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;

    try {
      const payload = {
        score: score ? parseFloat(score) : undefined,
        feedback: feedback.trim(),
        result,
      };

      const response = await API.put(`/interviews/${selectedInterview._id}`, payload);
      if (response.data.success) {
        toast.success("Interview scores and result updated!");
        fetchInterviews();
        closeResultModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit result");
    }
  };

  const openResultModal = (interview) => {
    setSelectedInterview(interview);
    setScore(interview.score !== undefined ? interview.score : "");
    setFeedback(interview.feedback || "");
    setResult(interview.result || "Pending");
    setShowResultModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedAppId("");
    setRoundName("");
    setInterviewDate("");
    setInterviewType("Technical");
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setSelectedInterview(null);
    setScore("");
    setFeedback("");
    setResult("Pending");
  };

  const typeIcon = (type) => {
    switch (type) {
      case "Coding Assessment":
        return "💻";
      case "Assignment":
        return "📝";
      case "HR":
        return "🤝";
      case "Managerial":
        return "👔";
      default:
        return "⚙️";
    }
  };

  const resultColor = (res) => {
    switch (res) {
      case "Selected":
        return "bg-green-50 border-green-200 text-green-600";
      case "Rejected":
        return "bg-red-50 border-red-200 text-red-600";
      case "On Hold":
        return "bg-yellow-50 border-yellow-200 text-yellow-600";
      default:
        return "bg-amber-50 border-amber-200 text-amber-700";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight font-sans">Interview Scheduler</h1>
          <p className="text-gray-500 mt-2">
            {role === "student"
              ? "View upcoming technical rounds, coding tests, and mentor review logs."
              : "Schedule technical rounds, record performance scores, and leave feedback."}
          </p>
        </div>
        {role !== "student" && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition duration-200 transform hover:-translate-y-0.5 cursor-pointer font-sans"
          >
            + Schedule Round
          </button>
        )}
      </div>

      {/* Grid of Interview rounds */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 text-center">
          <span className="text-4xl">📅</span>
          <h3 className="font-bold text-gray-800 text-xl mt-3">No interviews scheduled</h3>
          <p className="text-gray-400 text-sm mt-1">There are no upcoming interview processes listed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <span className="text-2xl p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      {typeIcon(interview.type)}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 tracking-tight leading-tight">
                        {interview.round}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
                        {interview.type}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${resultColor(interview.result)}`}>
                    {interview.result}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs border border-gray-100/50">
                  {role !== "student" && (
                    <div>
                      <span className="text-gray-400 font-bold uppercase block">Student</span>
                      <span className="text-gray-800 font-semibold">{interview.student?.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 font-bold uppercase block">Company</span>
                    <span className="text-amber-600 font-bold">{interview.job?.company?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase block">Job Position</span>
                    <span className="text-gray-800 font-semibold">{interview.job?.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase block">Date & Time</span>
                    <span className="text-gray-800 font-semibold">
                      {new Date(interview.date).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Score & Feedback */}
                {(interview.score !== undefined || interview.feedback) && (
                  <div className="border-t pt-4 space-y-2">
                    {interview.score !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-bold uppercase">Evaluator Rating:</span>
                        <span className="text-sm font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg">
                          ★ {interview.score}/10
                        </span>
                      </div>
                    )}
                    {interview.feedback && (
                      <div>
                        <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Feedback:</span>
                        <p className="text-gray-600 text-xs italic bg-gray-50 border rounded-xl p-3 leading-relaxed">
                          "{interview.feedback}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {role !== "student" && (
                <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-50 justify-end">
                  <button
                    onClick={() => openResultModal(interview)}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    📝 Log Score & Result
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📅 Schedule Interview Round</h2>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Select Application</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  required
                >
                  <option value="">Select Candidate Application</option>
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.student?.name} - {app.job?.company?.name} ({app.job?.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Round Name</label>
                <input
                  type="text"
                  placeholder="e.g. Technical Round 1, Managerial Round"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Round Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Coding Assessment">Coding Assessment</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Result Modal */}
      {showResultModal && selectedInterview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Record Evaluation Score</h2>
            <p className="text-gray-500 text-xs mb-4">
              Evaluating round <span className="font-bold">{selectedInterview.round}</span> for candidate <span className="font-bold">{selectedInterview.student?.name}</span>.
            </p>

            <form onSubmit={handleResultSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Rating Score (1-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    placeholder="e.g. 8.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Status Outcome</label>
                  <select
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Selected">Selected (Cleared)</option>
                    <option value="Rejected">Rejected (Failed)</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Interviewer Review Comments</label>
                <textarea
                  placeholder="Summarize candidate's problem-solving skills, communication, coding readiness..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none resize-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeResultModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm cursor-pointer"
                >
                  Log Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;

