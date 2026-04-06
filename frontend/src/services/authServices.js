import API from "./api";

// 1. User Sign Up
export const signUp = async (userData) => {
  const response = await API.post("/auth/signup", userData);
  return response.data;
};

// 2. User Sign In
export const signIn = async (credentials) => {
  const response = await API.post("/auth/signin", credentials);
  return response.data;
};

// 3. Register Seller
export const registerSellerAPI = async (formData) => {
  const response = await API.post("/auth/register-seller", formData);
  return response.data;
};

// 4. Get Current User Data (Token se user info nikalne ke liye)
export const fetchUserData = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};