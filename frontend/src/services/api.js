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
  if (url.startsWith("http") || url.startsWith("data:image")) return url;
  
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  
  // If we are on a production domain but the API_URL still points to localhost,
  // we use a relative path. This handles cases where the user builds for production
  // without updating the .env file, or when frontend and backend are on the same domain.
  if (typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      API_BASE_URL.includes('localhost')) {
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