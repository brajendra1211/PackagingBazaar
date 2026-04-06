import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔥 Interceptor: Har request ke sath token bhejne ke liye
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ─── AUTH METHODS ────────────────────────────────────────────────────────────

// 1. User Sign Up
export const signUp = async (userData) => {
  try {
    const response = await API.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 2. Login (Sign In)
export const signIn = async (credentials) => {
  try {
    const response = await API.post("/auth/signin", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 3. Seller Registration (Multi-step form) 🔥 Naya Add Kiya
export const registerSellerAPI = async (formData) => {
  try {
    const response = await API.post("/auth/register-seller", formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ─── PRODUCT METHODS ─────────────────────────────────────────────────────────

// Fetch All Products (Filters ke saath)
export const fetchProducts = async (params) => {
  try {
    const response = await API.get("/products", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error.response?.data || error;
  }
};

// Single Product Details
export const fetchProductById = async (id) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error.response?.data || error;
  }
};

// Top Selling Products
export const fetchTopSelling = async () => {
  try {
    const response = await API.get('/products/top-selling');
    return response.data;
  } catch (error) {
    console.error("Error fetching top selling:", error);
    throw error.response?.data || error;
  }
};

// ─── SELLER CRUD METHODS ─────────────────────────────────────────────────────

// Add New Product
export const createProduct = async (productData) => {
  try {
    const response = await API.post("/products/add", productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update Product
export const updateProduct = async (id, productData) => {
  try {
    const response = await API.put(`/products/update/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete Product
export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/products/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default API;

export const fetchSellerMetaData = async () => {
  try {
    const response = await API.get("/products/metadata");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};