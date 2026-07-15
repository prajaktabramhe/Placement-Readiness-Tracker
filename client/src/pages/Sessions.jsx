import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

const Sessions = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "student";

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [topic, setTopic] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [duration, setDuration] = useState("30");

  // Log Notes Modal
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Scheduled");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await fetchSessions();

      if (role !== "student") {
        // Fetch all students for scheduling select
        const studentRes = await API.get("/users/students");
        if (studentRes.data.success) {
          setStudents(studentRes.data.students);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mentorship panel");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await API.get("/sessions");
      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch sessions list");
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !topic || !sessionDate) {
      return toast.warning("All scheduling fields are required");
    }

    try {
      const payload = {
        studentId: selectedStudentId,
        topic: topic.trim(),
        date: sessionDate,
        duration: parseInt(duration),
      };

      const response = await API.post("/sessions", payload);
      if (response.data.success) {
        toast.success("Mentorship session scheduled successfully!");
        fetchSessions();
        closeScheduleModal();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to schedule session");
    }
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;

    try {
      const payload = {
        notes: notes.trim(),
        status,
      };

      const response = await API.put(`/sessions/${selectedSession._id}`, payload);
      if (response.data.success) {
        toast.success("Session feedback and status logged!");
        fetchSessions();
        closeNotesModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save session notes");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel and delete this session?")) return;

    try {
      const response = await API.delete(`/sessions/${sessionId}`);
      if (response.data.success) {
        toast.success("Session cancelled and deleted");
        fetchSessions();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete session");
    }
  };

  const openNotesModal = (session) => {
    setSelectedSession(session);
    setNotes(session.notes || "");
    setStatus(session.status || "Scheduled");
    setShowNotesModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedStudentId("");
    setTopic("");
    setSessionDate("");
    setDuration("30");
  };

  const closeNotesModal = () => {
    setShowNotesModal(false);
    setSelectedSession(null);
    setNotes("");
    setStatus("Scheduled");
  };

  const statusColor = (st) => {
    switch (st) {
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-blue-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight font-sans">Mentorship Sessions</h1>
          <p className="text-gray-500 mt-2">
            {role === "student"
              ? "Track your upcoming mock interviews, resume guidance, and scheduled mentor meetings."
              : "Schedule review sync-ups, record meeting feedback, and track student preparation."}
          </p>
        </div>
        {role !== "student" && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition duration-150 cursor-pointer text-sm font-sans"
          >
            + Schedule Session
          </button>
        )}
      </div>

      {/* Sessions Directory */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <span className="text-4xl">🤝</span>
          <h3 className="font-bold text-gray-800 text-xl mt-3">No sessions found</h3>
          <p className="text-gray-400 text-sm mt-1">There are no mentorship sessions listed on your panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight leading-tight">
                      💬 {session.topic}
                    </h3>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mt-1">
                      Duration: {session.duration} minutes
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${statusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs border border-gray-100">
                  {role === "student" ? (
                    <div>
                      <span className="text-gray-400 font-bold uppercase block">Mentor</span>
                      <span className="text-gray-800 font-semibold">{session.mentor?.name}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-gray-400 font-bold uppercase block">Student Candidate</span>
                      <span className="text-gray-800 font-semibold">{session.student?.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 font-bold uppercase block">Scheduled Date</span>
                    <span className="text-gray-800 font-semibold">
                      {new Date(session.date).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Meeting Minutes Notes */}
                {session.notes && (
                  <div className="border-t pt-4">
                    <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Meeting Notes & Feedback:</span>
                    <p className="text-gray-600 text-xs italic bg-gray-50 border rounded-xl p-3 leading-relaxed">
                      "{session.notes}"
                    </p>
                  </div>
                )}
              </div>

              {role !== "student" && (
                <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100 justify-end">
                  <button
                    onClick={() => openNotesModal(session)}
                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-blue-100 text-amber-700 border border-amber-200 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    📝 Log Notes & Status
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session._id)}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    🗑️ Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🤝 Schedule Mentorship Sync</h2>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  required
                >
                  <option value="">Select Candidate</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.preferredRole || "Role Not Listed"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Topic / Focus Area</label>
                <input
                  type="text"
                  placeholder="e.g. Resume Guidance, Mock Interview"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Duration (minutes)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none text-sm"
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm cursor-pointer"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Notes Modal */}
      {showNotesModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Record Session Log</h2>
            <p className="text-gray-500 text-xs mb-4">
              Topic: <span className="font-bold">{selectedSession.topic}</span> with candidate <span className="font-bold">{selectedSession.student?.name}</span>.
            </p>

            <form onSubmit={handleNotesSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Session Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Feedback & Meeting Minutes</label>
                <textarea
                  placeholder="Record summary of discussion, improvement tasks, and notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none resize-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeNotesModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm cursor-pointer"
                >
                  Log Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;

