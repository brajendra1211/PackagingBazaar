import API from "./api";

export const fetchCartAPI = async () => {
  const response = await API.get("/cart");
  return response.data;
};

// Updated to accept extra attributes
export const addToCartAPI = async (productId, quantity, attributes = {}) => {
  const { thickness, width, brand } = attributes;
  const response = await API.post("/cart", { productId, quantity, thickness, width, brand });
  return response.data;
};

// Updated to use cart_id for precise removal
export const removeFromCartAPI = async (cartId) => {
  const response = await API.delete(`/cart/${cartId}`);
  return response.data;
};

// Updated for sync
export const syncCartAPI = async (localItems) => {
  const response = await API.post("/cart/sync", { localItems });
  return response.data;
};

export const clearCartAPI = async () => {
  const response = await API.delete("/cart/clear");
  return response.data;
};
