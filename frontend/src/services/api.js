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
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  
  // Make sure the base URL includes '/api' because the backend serves static files from the same route as the API (e.g. /api/uploads)
  const baseUrlForImages = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
  
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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;