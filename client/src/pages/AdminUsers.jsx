import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/users");
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load platform users list");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await API.put(`/admin/users/${userId}`, { role: newRole });
      if (response.data.success) {
        toast.success("User role updated successfully!");
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will remove all their profiles, job posts, or applications permanently!")) return;

    try {
      const response = await API.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        toast.success("User account deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user account");
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchString = search.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(searchString);
    const emailMatch = u.email?.toLowerCase().includes(searchString);
    const matchesSearch = nameMatch || emailMatch;
    
    const matchesRole = roleFilter === "All" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight font-sans">Platform Users Registry</h1>
        <p className="text-gray-500 mt-2">Manage student, mentor, and administrator profile accounts.</p>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="🔍 Search users by name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2 p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="All">All User Roles</option>
          <option value="student">Students</option>
          <option value="mentor">Mentors</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 text-center">
          <span className="text-4xl">👥</span>
          <h3 className="font-bold text-gray-800 text-xl mt-3">No users found</h3>
          <p className="text-gray-400 text-sm mt-1">Try modifying your search query or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Designated Role</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold uppercase text-indigo-600 text-xs">
                        {u.name?.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      {u._id === currentUser.id ? (
                        <span className="px-3 py-1.5 rounded-lg border bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                          {u.role} (You)
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="border rounded-xl px-3 py-1.5 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u._id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Delete Account
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
