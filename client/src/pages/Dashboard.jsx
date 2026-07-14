import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";
import Navbar from "../components/Navbar";
import DashboardCharts from "../components/DashboardCharts";
import RecentApplications from "../components/RecentApplications";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data.stats);
    } catch (error) {
      console.log(error);
    }
  };

  if (!stats) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <h2 className="text-2xl font-semibold text-gray-600">
            Loading Dashboard...
          </h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome back! Here's your placement progress.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition duration-300">
              <p className="text-gray-500 font-medium">
                Total Applications
              </p>

              <h2 className="text-4xl font-bold text-blue-600 mt-3">
                {stats.totalApplications}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition duration-300">
              <p className="text-gray-500 font-medium">
                Applied
              </p>

              <h2 className="text-4xl font-bold text-yellow-500 mt-3">
                {stats.applied}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition duration-300">
              <p className="text-gray-500 font-medium">
                Interview
              </p>

              <h2 className="text-4xl font-bold text-purple-600 mt-3">
                {stats.interview}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition duration-300">
              <p className="text-gray-500 font-medium">
                Selected
              </p>

              <h2 className="text-4xl font-bold text-green-600 mt-3">
                {stats.selected}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition duration-300">
              <p className="text-gray-500 font-medium">
                Rejected
              </p>

              <h2 className="text-4xl font-bold text-red-500 mt-3">
                {stats.rejected}
              </h2>
            </div>

          </div>

          {/* Charts */}
          <DashboardCharts stats={stats} />
<RecentApplications />
        </div>
      </div>
    </>
  );
}