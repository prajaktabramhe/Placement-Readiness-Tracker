import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const DashboardCharts = ({ stats }) => {
  const pieData = {
    labels: ["Applied", "Interview", "Selected", "Rejected"],
    datasets: [
      {
        data: [
          stats.applied,
          stats.interview,
          stats.selected,
          stats.rejected,
        ],
        backgroundColor: [
          "#FBBF24",
          "#8B5CF6",
          "#22C55E",
          "#EF4444",
        ],
      },
    ],
  };

  const barData = {
    labels: ["Applied", "Interview", "Selected", "Rejected"],
    datasets: [
      {
        label: "Applications",
        data: [
          stats.applied,
          stats.interview,
          stats.selected,
          stats.rejected,
        ],
        backgroundColor: [
          "#FBBF24",
          "#8B5CF6",
          "#22C55E",
          "#EF4444",
        ],
      },
    ],
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-10">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Application Status</h2>
        <Pie data={pieData} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Statistics</h2>
        <Bar data={barData} />
      </div>
    </div>
  );
};

export default DashboardCharts;