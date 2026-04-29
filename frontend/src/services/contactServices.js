import API from "./api";

export const submitContactMessage = async (formData) => {
  try {
    const response = await API.post("/contact", formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to send message" };
  }
};

export const fetchAllContactMessages = async () => {
  try {
    const response = await API.get("/admin/contacts");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch messages" };
  }
};

export const updateContactMessageStatus = async (id, status) => {
  try {
    const response = await API.put(`/admin/contacts/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update status" };
  }
};
