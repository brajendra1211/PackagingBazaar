import API from "./api";

// --- Dashboard Summary ---
export const fetchDashboardStats = async () => {
  const response = await API.get("/admin/stats");
  return response.data;
};

// --- User Management ---
export const fetchAllUsers = async (page = 1, limit = 10) => {
  const response = await API.get(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const updateUserAccount = async (id, userData) => {
  const response = await API.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUserAccount = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};

// --- Seller Management ---
export const fetchAllSellers = async (page = 1, limit = 10) => {
  const response = await API.get(`/admin/sellers/all?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchPendingSellers = async (page = 1, limit = 10) => {
  const response = await API.get(`/admin/sellers/pending?page=${page}&limit=${limit}`);
  return response.data;
};

export const approveSellerAccount = async (id) => {
  const response = await API.put(`/admin/sellers/${id}/approve`);
  return response.data;
};

export const rejectSellerAccount = async (id) => {
  const response = await API.delete(`/admin/sellers/${id}/reject`);
  return response.data;
};

// --- Product Management ---
export const fetchAllProductsAdmin = async (page = 1, limit = 10) => {
  const response = await API.get(`/admin/products/all?page=${page}&limit=${limit}`);
  return response.data;
};

export const deleteProductAdmin = async (id) => {
  const response = await API.delete(`/admin/products/${id}`);
  return response.data;
};

export const toggleHotDealAdmin = async (id, isHotDeal) => {
  const response = await API.patch(`/admin/products/${id}/hot-deal`, { is_hot_deal: isHotDeal });
  return response.data;
};

// --- Sales Management ---
export const fetchAllOrdersAdmin = async (page = 1, limit = 10) => {
  const response = await API.get(`/admin/orders?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchUserOrdersAdmin = async (userId) => {
  const response = await API.get(`/admin/orders/user/${userId}`);
  return response.data;
};

export const fetchSellerOrdersAdmin = async (sellerId, page = 1, limit = 10) => {
  const response = await API.get(`/admin/orders/seller/${sellerId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchSellerProductsAdmin = async (sellerId, page = 1, limit = 10) => {
  const response = await API.get(`/admin/products/seller/${sellerId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchSellersWithOrdersAdmin = async (page = 1, limit = 10) => {
  const response = await API.get(`/admin/sellers/with-orders?page=${page}&limit=${limit}`);
  return response.data;
};

// --- Lead Management (Inquiries) ---
export const fetchInquiriesAdmin = async (page = 1, limit = 10) => {
  const response = await API.get(`/admin/inquiries?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchLeadRecommendations = async (id) => {
  const response = await API.get(`/admin/inquiries/${id}/recommendations`);
  return response.data;
};

