import express from 'express';
import { getAllReviews, addReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

// Route: GET /api/reviews?product_id=1 
router.get('/', getAllReviews);

// Route: POST /api/reviews/add 
router.post('/add', addReview);

// Route: DELETE /api/reviews/:id 
router.delete('/:id', deleteReview);

export default router;