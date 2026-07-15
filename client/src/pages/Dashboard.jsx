import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("student");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await API.get("/dashboard/stats");
      if (response.data.success) {
        setRole(response.data.role);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // =========================================================================
  // RENDER STUDENT DASHBOARD
  // =========================================================================
  if (role === "student" && stats) {
    const statusPieData = {
      labels: Object.keys(stats.statusCounts || {}),
      datasets: [
        {
          data: Object.values(stats.statusCounts || {}),
          backgroundColor: [
            "#3b82f6", // Applied - Blue
            "#a855f7", // Shortlisted - Purple
            "#facc15", // Assessment Scheduled - Yellow
            "#eab308", // Assessment Completed - Gold
            "#6366f1", // Interview Scheduled - Indigo
            "#4f46e5", // Interview Completed - Dark Indigo
            "#22c55e", // Offer Received - Green
            "#ef4444", // Rejected - Red
            "#9ca3af", // Withdrawn - Gray
          ],
          borderWidth: 0,
        },
      ],
    };

    const skillBarData = {
      labels: Object.keys(stats.skillCounts || {}),
      datasets: [
        {
          label: "Number of Skills",
          data: Object.values(stats.skillCounts || {}),
          backgroundColor: "rgba(99, 102, 241, 0.85)",
          borderRadius: 8,
        },
      ],
    };

    const timelineLineData = {
      labels: (stats.applicationsTimeline || []).map((t) => t.month),
      datasets: [
        {
          label: "Applications Submitted",
          data: (stats.applicationsTimeline || []).map((t) => t.count),
          fill: true,
          borderColor: "rgb(79, 70, 229)",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          tension: 0.4,
          pointRadius: 4,
        },
      ],
    };

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Banner */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Student Dashboard</h1>
          <p className="text-gray-500 mt-2">Check preparation status, upcoming timelines, and visual stats.</p>
        </div>

        {/* Top Widgets Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Preparation Score</span>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-1">{stats.readinessScore}%</h2>
            </div>
            <span className="text-3xl p-3 bg-amber-50 rounded-2xl">⚡</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Jobs Applied</span>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-1">{stats.totalApplications}</h2>
            </div>
            <span className="text-3xl p-3 bg-amber-50 rounded-2xl">📝</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Readiness Zone</span>
              <h2 className={`text-xl font-bold mt-2 ${stats.readinessStatus === "Ready" ? "text-green-600" : "text-yellow-600"}`}>
                {stats.readinessStatus === "Ready" ? "🚀 ELIGIBLE" : "⚠️ UNAPPROVED"}
              </h2>
            </div>
            <span className="text-3xl p-3 bg-green-50 rounded-2xl">🎓</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-between">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Application Breakdown</h3>
            {stats.totalApplications === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">Submit job applications to populate stats.</p>
            ) : (
              <div className="max-w-[200px] mx-auto">
                <Doughnut data={statusPieData} options={{ plugins: { legend: { display: false } } }} />
              </div>
            )}
            <div className="text-[10px] text-gray-400 text-center mt-4">
              Status distribution of current applied positions.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Skill Proficiency Profile</h3>
            <div className="h-[200px]">
              <Bar data={skillBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Application Submissions</h3>
            <div className="h-[200px]">
              <Line data={timelineLineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

        </div>

        {/* Bottom Section: Interviews and Target Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Interviews */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Upcoming Interview Rounds</h3>
            {!stats.upcomingInterviews || stats.upcomingInterviews.length === 0 ? (
              <p className="text-gray-400 text-sm py-6">No scheduled interview rounds found.</p>
            ) : (
              <div className="space-y-4">
                {stats.upcomingInterviews.map((int) => (
                  <div key={int._id} className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{int.round}</h4>
                      <span className="text-xs text-amber-600 font-semibold">{int.job?.company?.name} • {int.type}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(int.date).toLocaleDateString()} {new Date(int.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Skills Target Role */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Target Role Skill Gaps</h3>
            {!stats.missingSkills || stats.missingSkills.length === 0 ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <span className="text-lg">✓</span>
                <p className="text-green-700 text-xs font-semibold mt-1">Excellent! No missing target role skill gaps detected.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Based on your preferred role target, recruiters expect these missing skills in your profile:
                </p>
                <div className="flex gap-2 flex-wrap pt-2">
                  {stats.missingSkills.map((skill, idx) => (
                    <span key={idx} className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-1 rounded-xl font-bold uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="pt-4 text-center">
                  <Link to="/profile" className="text-amber-600 hover:underline text-xs font-bold">
                    ✏️ Update profile skills list →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER MENTOR DASHBOARD
  // =========================================================================
  if (role === "mentor" && stats) {
    const progressPieData = {
      labels: ["Placement Ready", "Not Ready"],
      datasets: [
        {
          data: [stats.readyCount, stats.notReadyCount],
          backgroundColor: ["#22c55e", "#facc15"],
          borderWidth: 0,
        },
      ],
    };

    const companyBarData = {
      labels: (stats.companyProgress || []).map((c) => c.company),
      datasets: [
        {
          label: "Applications Received",
          data: (stats.companyProgress || []).map((c) => c.count),
          backgroundColor: "rgba(79, 70, 229, 0.8)",
          borderRadius: 8,
        },
      ],
    };

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Banner */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Mentor Console</h1>
          <p className="text-gray-500 mt-2">Track student readiness metrics, interview lineups, and skill gaps.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <span className="text-xs font-bold text-gray-400 uppercase block">Registered Students</span>
            <h2 className="text-3xl font-extrabold text-gray-800 mt-1">{stats.totalStudents}</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <span className="text-xs font-bold text-gray-400 uppercase block">Placement Ready</span>
            <h2 className="text-3xl font-extrabold text-green-600 mt-1">{stats.readyCount}</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <span className="text-xs font-bold text-gray-400 uppercase block">Under Preparation</span>
            <h2 className="text-3xl font-extrabold text-yellow-600 mt-1">{stats.notReadyCount}</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <span className="text-xs font-bold text-gray-400 uppercase block">Interviews Scheduled (7d)</span>
            <h2 className="text-3xl font-extrabold text-amber-600 mt-1">{stats.interviewsThisWeekCount}</h2>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Readiness gauge pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-between">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Readiness Distribution</h3>
            {stats.totalStudents === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">No students registered yet.</p>
            ) : (
              <div className="max-w-[190px] mx-auto">
                <Pie data={progressPieData} options={{ plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { weight: "bold" } } } } }} />
              </div>
            )}
            <div className="text-[10px] text-gray-400 text-center mt-4">
              Ratio of students eligible vs training.
            </div>
          </div>

          {/* Company counts bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 lg:col-span-2">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Company Application Volume</h3>
            <div className="h-[220px]">
              <Bar data={companyBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

        </div>

        {/* Bottom Section: Low Readiness list & Interviews Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Low Readiness Alert panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-4 lg:col-span-1">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Needs Profile Boost</h3>
            <p className="text-xs text-gray-400">Students with low readiness scores under 50%:</p>
            
            {stats.lowReadiness?.length === 0 ? (
              <p className="text-xs text-green-600 font-bold bg-green-50 border rounded-xl p-4">All students CGPA & skills are above 50%!</p>
            ) : (
              <div className="space-y-3">
                {stats.lowReadiness?.map((student) => (
                  <div key={student._id} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-xl text-xs">
                    <div>
                      <h4 className="font-bold text-gray-800">{student.name}</h4>
                      <span className="text-gray-400">{student.preferredRole || "Designation not set"}</span>
                    </div>
                    <span className="font-extrabold text-red-600">{student.readinessScore}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview List Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 lg:col-span-2">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Lineups Scheduled This Week</h3>
            {stats.interviewsThisWeekCount === 0 ? (
              <p className="text-gray-400 text-sm py-10 text-center">No interviews scheduled for the next 7 days.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2">Student</th>
                      <th className="px-4 py-2">Company & Role</th>
                      <th className="px-4 py-2">Round</th>
                      <th className="px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {stats.interviewsThisWeek.map((int) => (
                      <tr key={int._id}>
                        <td className="px-4 py-3 font-bold text-gray-800">{int.student?.name}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold block">{int.job?.company?.name}</span>
                          <span className="text-gray-400">{int.job?.title}</span>
                        </td>
                        <td className="px-4 py-3 capitalize font-medium text-amber-600">{int.round} ({int.type})</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(int.date).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER ADMIN DASHBOARD
  // =========================================================================
  if (role === "admin" && stats) {
    const rolePieData = {
      labels: Object.keys(stats.roleDistribution || {}),
      datasets: [
        {
          data: Object.values(stats.roleDistribution || {}),
          backgroundColor: ["#6366f1", "#a855f7", "#3b82f6"],
          borderWidth: 0,
        },
      ],
    };

    const outcomePieData = {
      labels: ["Placed (Selected)", "Rejected", "In Process"],
      datasets: [
        {
          data: Object.values(stats.outcomeBreakdown || {}),
          backgroundColor: ["#22c55e", "#ef4444", "#eab308"],
          borderWidth: 0,
        },
      ],
    };

    const monthlyTrendData = {
      labels: (stats.monthlyTrends || []).map((t) => t.month),
      datasets: [
        {
          label: "Volume of Applications",
          data: (stats.monthlyTrends || []).map((t) => t.count),
          fill: true,
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          tension: 0.3,
        },
      ],
    };

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Banner */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Admin Console</h1>
          <p className="text-gray-500 mt-2">Global insights on user distribution, posting metrics, and outcomes.</p>
        </div>

        {/* Global Summary Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <span className="text-xs font-bold text-gray-400 uppercase block">Overall Placed Conversion Rate</span>
            <h2 className="text-3xl font-extrabold text-amber-600 mt-1">{stats.placementRate}%</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <span className="text-xs font-bold text-gray-400 uppercase block">Active Job Openings</span>
            <h2 className="text-3xl font-extrabold text-green-600 mt-1">{stats.activeJobs}</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <span className="text-xs font-bold text-gray-400 uppercase block">Registered Companies</span>
            <h2 className="text-3xl font-extrabold text-gray-800 mt-1">{stats.totalCompanies}</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <span className="text-xs font-bold text-gray-400 uppercase block">Platform System Users</span>
            <h2 className="text-3xl font-extrabold text-gray-800 mt-1">{stats.totalUsers}</h2>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User roles pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-between">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">User Roles Ratio</h3>
            <div className="max-w-[170px] mx-auto">
              <Pie data={rolePieData} options={{ plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { weight: "bold" } } } } }} />
            </div>
            <div className="text-[10px] text-gray-400 text-center mt-4">
              Breakdown of student/mentor/admin accounts.
            </div>
          </div>

          {/* Outcomes distribution pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-between">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Placement Outcomes</h3>
            <div className="max-w-[170px] mx-auto">
              <Doughnut data={outcomePieData} options={{ plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { weight: "bold" } } } } }} />
            </div>
            <div className="text-[10px] text-gray-400 text-center mt-4">
              Student hiring selection conversion ratio.
            </div>
          </div>

          {/* Monthly trends line */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Monthly Submissions</h3>
            <div className="h-[220px]">
              <Line data={monthlyTrendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-600">No Statistics Available</h2>
    </div>
  );
};

export default Dashboard;
