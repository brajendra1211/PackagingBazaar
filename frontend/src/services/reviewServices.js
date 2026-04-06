import API from "./api";

// 1. Fetch Reviews (Product ID ke basis par ya saare)
export const fetchReviews = async (productId) => {
  const url = productId ? `/reviews?product_id=${productId}` : "/reviews";
  const response = await API.get(url);
  return response.data;
};

// 2. Add Review
export const addReviewAPI = async (reviewData) => {
  const response = await API.post("/reviews/add", reviewData);
  return response.data;
};

// 3. Delete Review
export const deleteReviewAPI = async (id) => {
  const response = await API.delete(`/reviews/${id}`);
  return response.data;
};