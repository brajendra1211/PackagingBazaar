import API from "./api";

export const checkoutAPI = async (checkoutData) => {
  const response = await API.post("/orders/checkout", checkoutData);
  return response.data;
};

export const fetchMyOrdersAPI = async () => {
  const response = await API.get("/orders/my-orders");
  return response.data;
};
