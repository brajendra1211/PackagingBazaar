import express from 'express';
import { getAllReviews, addReview, deleteReview, updateReviewStatus } from '../controllers/reviewController.js';

const router = express.Router();

// Route: GET /api/reviews?product_id=1 
router.get('/', getAllReviews);

// Route: POST /api/reviews/add 
router.post('/add', addReview);

// Route: DELETE /api/reviews/:id 
router.delete('/:id', deleteReview);

// Route: PUT /api/reviews/:id/status
router.put('/:id/status', updateReviewStatus);

export default router;