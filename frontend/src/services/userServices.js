import API from "./api";

// Profile APIs
export const fetchUserProfile = async () => {
  const response = await API.get("/user/profile");
  return response.data;
};

export const updateUserProfileAPI = async (name) => {
  const response = await API.put("/user/profile", { name });
  return response.data;
};

// Address APIs
export const fetchAddresses = async () => {
  const response = await API.get("/user/addresses");
  return response.data;
};

export const addAddressAPI = async (addressData) => {
  const response = await API.post("/user/addresses", addressData);
  return response.data;
};

export const updateAddressAPI = async (id, addressData) => {
  const response = await API.put(`/user/addresses/${id}`, addressData);
  return response.data;
};

export const deleteAddressAPI = async (id) => {
  const response = await API.delete(`/user/addresses/${id}`);
  return response.data;
};

export const setDefaultAddressAPI = async (id) => {
  const response = await API.patch(`/user/addresses/${id}/default`);
  return response.data;
};
