import API from "../api/axios";

export const uploadResume = async (companyId, file) => {
  const formData = new FormData();

  formData.append("resume", file);

  const response = await API.put(
    `/resume/${companyId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};