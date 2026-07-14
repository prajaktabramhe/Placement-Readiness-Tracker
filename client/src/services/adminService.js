import API from "../api/axios";

export const getUsers = async () => {
  const response = await API.get("/admin/users");
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await API.put(`/admin/users/${id}`, {
    role,
  });

  return response.data;
};

export const deleteUser = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};