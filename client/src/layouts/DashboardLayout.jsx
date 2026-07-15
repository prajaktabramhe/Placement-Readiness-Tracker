import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Role-Based Sidebar Navigation */}
      <Sidebar />

      {/* Scrollable Main Content Frame */}
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Amber top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-700 shrink-0" />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
