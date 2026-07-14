import API from "../api/axios";

export const getDashboardStats = async () => {
  const token = localStorage.getItem("token");

  const response = await API.get("/dashboard/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};