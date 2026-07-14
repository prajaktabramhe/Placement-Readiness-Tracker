import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { getDashboardStats } from "../services/dashboardService";

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
          <h2 className="text-2xl font-semibold">
            Loading Dashboard...
          </h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 p-8">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-4xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-2 mb-8">
            Welcome back! Here's your placement progress.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

            <StatsCard
              title="Total"
              value={stats.totalApplications}
              color="text-blue-600"
            />

            <StatsCard
              title="Applied"
              value={stats.applied}
              color="text-yellow-500"
            />

            <StatsCard
              title="Interview"
              value={stats.interview}
              color="text-purple-600"
            />

            <StatsCard
              title="Selected"
              value={stats.selected}
              color="text-green-600"
            />

            <StatsCard
              title="Rejected"
              value={stats.rejected}
              color="text-red-600"
            />

          </div>

        </div>

      </div>
    </>
  );
}