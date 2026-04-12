import API from "./api";

export const fetchProducts = async (params) => {
  const response = await API.get("/products", { params });
  return response.data;
};

export const fetchCategories = async () => {
  const response = await API.get("/categories");
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const fetchProductVariants = async (id) => {
  const response = await API.get(`/products/${id}/variants`);
  return response.data;
};

export const fetchTopSelling = async () => {
  const response = await API.get('/products/top-selling');
  return response.data;
};

export const fetchHotDeals = async () => {
  const response = await API.get('/products/hot-deals');
  return response.data;
};

export const fetchUniqueProductNames = async () => {
  const response = await API.get('/products/names');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await API.post("/products/add", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await API.put(`/products/update/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await API.delete(`/products/delete/${id}`);
  return response.data;
};

export const fetchSellerMetaData = async () => {
  const response = await API.get("/products/metadata");
  return response.data;
};