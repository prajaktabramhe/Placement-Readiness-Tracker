import API from "../api/axios";

// Register User
export const registerUser = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

// Login User
export const loginUser = async (userData) => {
  const response = await API.post("/auth/login", userData);

  console.log("Inside authService:", response);
  console.log("Returning:", response.data);

  return response.data;
};