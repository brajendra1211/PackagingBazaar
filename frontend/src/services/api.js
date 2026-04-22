import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;

// Agar hum localhost par hain aur url mein /api nahi hai, toh hum manually '/api' add kar sakte hain
// Lekin product/image urls ke liye humein dhayan rakhna hoga.
export const API_BASE_URL = API_URL;

const API = axios.create({
  // Agar API_URL mein pehle se /api hai toh wahi use karein, warna /api add karein
  baseURL: API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`,
});

export const getImageUrl = (url) => {
  if (!url) return "";

  // Handle cases where absolute localhost URLs might be stored in the database
  if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
    const parts = url.split('/uploads/');
    if (parts.length > 1) {
      url = '/uploads/' + parts[1];
    }
  }
  
  if (url.startsWith("http") || url.startsWith("data:image")) return url;
  
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  
  // In production (non-localhost), always try to use relative paths for local uploads
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return cleanUrl;
  }
  
  // The backend serves static files from the root domain (e.g., /uploads), NOT under /api
  let baseUrlForImages = API_BASE_URL;
  
  if (baseUrlForImages.endsWith("/api")) {
    baseUrlForImages = baseUrlForImages.slice(0, -4);
  }
  
  // If API is relative (e.g., '/api'), baseUrlForImages might become empty. That is fine, it will use relative path.
  return `${baseUrlForImages}${cleanUrl}`;
};


// Interceptor: Har request ke sath token bhejne ke liye
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Safer error handling to prevent 'payload' or 'undefined' crashes
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      if (typeof window !== 'undefined' && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error?.response?.data || error);
  }
);

export default API;