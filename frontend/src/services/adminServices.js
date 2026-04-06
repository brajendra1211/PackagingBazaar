import api from "./api"; // Ensure `api.js` is properly exporting an Axios instance with interceptors

export const fetchPendingSellers = async () => {
  try {
    const response = await api.get("/admin/sellers/pending");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveSellerAccount = async (userId) => {
  try {
    const response = await api.put(`/admin/sellers/${userId}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectSellerAccount = async (userId) => {
  try {
    const response = await api.delete(`/admin/sellers/${userId}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
