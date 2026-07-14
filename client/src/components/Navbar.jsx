import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 shadow-md">

      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        <h2 className="text-2xl font-bold text-white">
          Placement Readiness Tracker
        </h2>

        <div className="flex items-center gap-8">

          <div className="text-right">

            <p className="text-white font-semibold">
              Welcome, {user?.name}
            </p>

            <p className="text-blue-100 text-sm capitalize">
              {user?.role}
            </p>

          </div>

          <Link
            to="/dashboard"
            className="text-white hover:text-blue-200 transition"
          >
            Dashboard
          </Link>

          <Link
            to="/companies"
            className="text-white hover:text-blue-200 transition"
          >
            Companies
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-yellow-300 font-semibold hover:text-yellow-200"
            >
              Admin Panel
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition"
          >
            Logout
          </button>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;