import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../services/adminService";
import { toast } from "react-toastify";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(data.users);
    } catch (error) {
      console.error(error);

      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);

      toast.success("Role updated successfully");

      fetchUsers();
    } catch (error) {
      console.error(error);

      toast.error("Unable to update role");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(id);

      toast.success("User deleted successfully");

      fetchUsers();
    } catch (error) {
      console.error(error);

      toast.error("Delete failed");
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-gray-100 flex items-center justify-center">

          <div className="bg-white rounded-xl shadow-lg p-10 text-center">

            <h1 className="text-4xl font-bold text-red-600">
              Access Denied
            </h1>

            <p className="text-gray-500 mt-4">
              Only administrators can access this page.
            </p>

          </div>

        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 p-8">

        <div className="max-w-7xl mx-auto">

          <div className="mb-8">

            <h1 className="text-4xl font-bold text-gray-800">
              Admin Panel
            </h1>

            <p className="text-gray-500 mt-2">
              Manage all registered users.
            </p>

          </div>

          {loading ? (
            <div className="text-center py-20">

              <h2 className="text-2xl font-semibold">
                Loading Users...
              </h2>

            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">

              <table className="min-w-full">

                <thead className="bg-blue-600 text-white">

                  <tr>

                    <th className="px-6 py-4 text-left">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left">
                      Role
                    </th>

                    <th className="px-6 py-4 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr
                      key={user._id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-medium">
                        {user.name}
                      </td>

                      <td className="px-6 py-4">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">

                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user._id,
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2"
                        >
                          <option value="student">
                            Student
                          </option>

                          <option value="mentor">
                            Mentor
                          </option>

                          <option value="admin">
                            Admin
                          </option>

                        </select>

                      </td>

                      <td className="px-6 py-4 text-center">

                        {user._id !== currentUser.id && (
                          <button
                            onClick={() =>
                              handleDelete(user._id)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            Delete
                          </button>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </>
  );
};

export default Admin;