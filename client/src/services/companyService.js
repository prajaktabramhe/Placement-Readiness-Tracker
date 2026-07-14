import api from "../api/axios";

// Get all companies
export const getCompanies = async (search = "") => {
  const response = await api.get("/company", {
    params: {
      search,
    },
  });

  return response.data;
};

// Add company
export const addCompany = async (data) => {
  const response = await api.post("/company", data);
  return response.data;
};

// Update company
export const updateCompany = async (id, data) => {
  const response = await api.put(`/company/${id}`, data);
  return response.data;
};

// Delete company
export const deleteCompany = async (id) => {
  const response = await api.delete(`/company/${id}`);
  return response.data;
};