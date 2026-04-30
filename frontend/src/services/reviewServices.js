import API from "./api";

export const fetchAllReviews = async (params) => {
    const response = await API.get("/reviews", { params });
    return response.data;
};

export const addManualReview = async (reviewData) => {
    const response = await API.post("/reviews/add", reviewData);
    return response.data;
};

export const deleteReview = async (id) => {
    const response = await API.delete(`/reviews/${id}`);
    return response.data;
};

export const updateReviewStatus = async (id, status) => {
    const response = await API.put(`/reviews/${id}/status`, { status });
    return response.data;
};