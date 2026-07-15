import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "student";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition duration-200 ${
      isActive(path)
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/35"
        : "text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 h-screen sticky top-0 shrink-0">
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-2.5 rounded-xl text-white font-bold text-xl shadow-md shadow-emerald-600/20">
            PR
          </div>
          <div>
            <h1 className="font-extrabold text-gray-800 leading-none text-lg">Placement</h1>
            <span className="text-gray-400 text-xs font-semibold">Readiness Tracker</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold uppercase text-lg">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-gray-800 text-sm truncate">{user?.name}</h4>
            <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50 uppercase leading-tight tracking-wider">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest pl-2 mb-2">Main Menu</p>
          
          <Link to="/dashboard" className={linkStyle("/dashboard")}>
            📊 <span>Dashboard</span>
          </Link>

          <Link to="/profile" className={linkStyle("/profile")}>
            👤 <span>Readiness Profile</span>
          </Link>

          {/* Student Specific */}
          {role === "student" && (
            <>
              <Link to="/jobs" className={linkStyle("/jobs")}>
                💼 <span>Job Board</span>
              </Link>
              <Link to="/applications" className={linkStyle("/applications")}>
                📝 <span>My Applications</span>
              </Link>
              <Link to="/interviews" className={linkStyle("/interviews")}>
                📅 <span>Interviews</span>
              </Link>
              <Link to="/sessions" className={linkStyle("/sessions")}>
                🤝 <span>Mentorship Sessions</span>
              </Link>
            </>
          )}

          {/* Mentor Specific */}
          {role === "mentor" && (
            <>
              <Link to="/jobs" className={linkStyle("/jobs")}>
                💼 <span>Jobs Manager</span>
              </Link>
              <Link to="/applications" className={linkStyle("/applications")}>
                📝 <span>Student Applications</span>
              </Link>
              <Link to="/interviews" className={linkStyle("/interviews")}>
                📅 <span>Schedules</span>
              </Link>
              <Link to="/sessions" className={linkStyle("/sessions")}>
                🤝 <span>Mentorship Sessions</span>
              </Link>
            </>
          )}

          {/* Admin Specific */}
          {role === "admin" && (
            <>
              <Link to="/admin" className={linkStyle("/admin")}>
                👥 <span>Users List</span>
              </Link>
              <Link to="/companies" className={linkStyle("/companies")}>
                🏢 <span>Company Registry</span>
              </Link>
              <Link to="/jobs" className={linkStyle("/jobs")}>
                💼 <span>Job Openings</span>
              </Link>
              <Link to="/applications" className={linkStyle("/applications")}>
                📝 <span>Applications Log</span>
              </Link>
              <Link to="/interviews" className={linkStyle("/interviews")}>
                📅 <span>Interviews Panel</span>
              </Link>
              <Link to="/sessions" className={linkStyle("/sessions")}>
                🤝 <span>Mentorship Sessions</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-200 cursor-pointer"
      >
        🚪 <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
